const express= require("express")
const mongoose= require("mongoose") 
const {generateotp, verifyotp}= require("../Services/OtpService/Otp")
const { User, Shopkeeper,Executive } = require("../Model/UserModel/UserModel")
const { otptoemailforverification } = require("../Services/EmailService/Email")
const Handle = require("../HandleResponse/HandleResponse")
const Product= require("../Model/ProductModel/Product")
const checkuserdetails = require("../MiddleWare/CheckUser")
const jwt= require("jsonwebtoken")
const Customer= require("../Model/Customer/CustomerModel")
const Routes= express.Router()
const {Invoice, Transaction}= require("../Model/TransactionModel/TransactionModel")
const OrderedItems= require("../Model/OrderItemModel/OrderItemModel")
Routes.get("/Health", (req,resp) => {
   return resp.status(200).json({message:"Everything is going right way"})
})
Routes.post("/verifyshopkeeper",async (req,resp) => {
  try{
    const {name,phone,city,state,email,address,password}=req.body
if(!name || !phone ||!email || !address || !city || !state ||!password) return resp.status(404).send({message:"Filed is empty. Recheck it."})

  const existinguser= await User.findOne({email})
  if(existinguser) return Handle(resp,404,"Email already exists. Please recheck and retry")

      const otp= generateotp(email)
      return await otptoemailforverification(resp,email,otp)
  }
  catch (error) {
    return Handle(resp,500,"Internal server error.",null,error)   
   }
})
 

Routes.post("/createshopkeeper",async (req,resp) => {
try {
    const {name,phone,city,state,email,address,password,otp}=req.body
    if(!name || !phone ||!email || !address || !city || !state ||!password){
        return  Handle(resp,404,"Filed is empty. Recheck it.",)
    }
   
    if(!otp) return Handle(resp,404,"Enter the otp.")
    
        const existinguser= await User.findOne({email})
        if(existinguser) return Handle(resp,404,"Email already exists. Please recheck and retry")
    
    const response= verifyotp(email,otp)
    if(!response.status) return Handle(resp,404,response.message)
    
        const result=await Shopkeeper.create({name,phone,city,email,address,password,city,state})
    
        return Handle(resp,201,"Account created successfully",result) 
} catch (error) {
    return Handle(resp,500,"Internal server error occured.",null,error)
}
})
Routes.post("/login", async (req, resp) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return Handle(resp,404,"Field is Empty");

    const result = await User.findOne({ email });
    if (!result) return Handle(resp,401,"Invalid Email");

    if (password === result.password) {
    //   if (!result.service) return Handle(resp,401,"Your service is disabled");
const payload={id:result._id}
const token= jwt.sign(payload,process.env.JSON_SECRET_KEY)
    return Handle(resp,202,"login successfully",{token,role:result.role})
    }
    return Handle(resp,401,"Invalid Password");
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error);
  }
});
Routes.get("/getallusers",checkuserdetails,async(req,resp)=>{
  try {
    const users = await User.find({role:{$ne:'Superadmin'}}).select("-password")
    if(users.length===0) return Handle(resp,400,"No user found")
    return Handle(resp,202,"Users fetched successfully",users)
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error)
  }
})
Routes.post("/fetchuserdetails",checkuserdetails, async(req,resp)=>{
  const payload={id:req.user._id}
  const token= jwt.sign(payload,process.env.JSON_SECRET_KEY)
      return Handle(resp,202,"login successfully",{role:req.user.role,token})
    

})
Routes.post("/enable", async (req, resp) => {
  try {
    const { id } = req.body;
    if (!id) return Handle(resp,404,"Plz Select the user");

    const existinguser = await User.findOne({ _id: id });
    if (!existinguser) return Handle(resp,404,"User is not found");

    const result = await User.updateOne({ _id: id },{ $set: { service: true } });
    return Handle(resp,202,"Service is enabled",result)
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error)
  }
});
Routes.post("/disable", async (req, resp) => {
  try {
    const { id } = req.body;
    if (!id) return Handle(resp,404,"Plz Select the user");

    const existinguser = await User.findOne({ _id: id });
    if (!existinguser) return Handle(resp,404,"User is not found");

    const result = await User.updateOne({ _id: id },{ $set: { service: false } });
    return Handle(resp,202,"Service is disabled",result)
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error)
  }
});

Routes.post("/addproduct",checkuserdetails,async(req,resp)=>{
    try {
        const {name,company,model,description,price,discount,rate,tax,stock}=req.body
        if(!name ||!company ||!model ||!description ||!price ||!discount ||!rate ||!tax) return Handle(resp,404,"Field is Empty")
        
        const existingproduct=await Product.findOne({model})
        if(existingproduct) return Handle(resp,400,"Product of this model already exists")
        
        const newproduct=await Product.create({userid:req.user._id,name,company,model,description,price,discount,rate,tax,stock})
        return Handle(resp,201,"Product added successfully",newproduct)
    } catch (error) {
        return Handle(resp,500,"Internal Server error",null, error )
    }
})
Routes.get("/getproducts",checkuserdetails,async(req,resp)=>{
    try {
        const allproducts=await Product.find({userid:req.user._id})
        if(allproducts.length===0) return Handle(resp,404,"Your product list is empty")
        
        return Handle(resp,202,"All Products successfully fetched",allproducts)
    } catch (error) {
      return Handle(resp,500,"Internal Server error",null, error )       
    }
})
Routes.delete("/deleteproduct/:id",checkuserdetails,async(req,resp)=>{
    try {
        const {id}=req.params
        if(!id) return Handle(resp,404,"Plz select the product")
        
        const existingproduct=await Product.findOne({_id:id,userid:req.user._id})
        if(!existingproduct) return Handle(resp,404,"This product is not found in your product list.")
        
        const result=await Product.deleteOne({_id:id,userid:req.user._id})
        return Handle(resp,202,"Product deleted successfully",result)
    } catch (error) {
       return Handle(resp,500,"Internal Server error",null, error );
    }
})
Routes.put("/updateproduct/:id",checkuserdetails,async(req,resp)=>{
    try {
        const {name,company,model,description,price,discount,rate,tax,stock}=req.body
        if(!name ||!company ||!model ||!description ||!price ||!discount ||!rate ||!tax) return Handle(resp,404,"Field is Empty")
        
        const {id}=req.params
        if(!id) return Handle(resp,404,"Plz select the product")

        const existingproduct=await Product.findOne({_id:id,userid:req.user._id})
        if(!existingproduct) return Handle(resp,404,"This product is not found in your product list")
        
        const response=await Product.findOne({model})
        if(response) return Handle(resp,400,"Product of this model is already exists in your product list")

          
        const updatedproduct=await Product.updateOne({_id:id},{$set:{name,company,model,description,price,discount,rate,tax,stock}})
        return Handle(resp,202,"Product updated successfully",updatedproduct)
    } catch (error) {
        return Handle(resp,500,"Internal Server error",null,error);
    }
})

const validateObjectKeys = (object, schema) => {
  const schemaKeys = Object.keys(schema.paths).filter((key) => key !== '__v' && key !== '_id' && key !== 'createdat');
  const objectKeys = Object.keys(object);

  for (const key of schemaKeys) {
    if (!object.hasOwnProperty(key) || object[key] === null || object[key] === '') return "The key "+key+" is missing or empty."
  }

  for (const key of objectKeys) {
    if (!schemaKeys.includes(key)) return "The key "+key+" is not declared in the schema."
  }

  return null;
};
Routes.post("/addmultipleproducts",checkuserdetails,async(req,resp)=>{
  try {
      const {items} = req.body;
      if (!Array.isArray(items) || items.length === 0) return Handle(resp,400,'Invalid input. Provide an array of items.')
      const updateditems= items.map(item=>{return {...item,userid:req.user._id}})
      const errors = [];
      updateditems.map(async(item,index)=>{
          const validationError = validateObjectKeys(item, Product.schema);
          if (validationError) errors.push({ index, error: validationError })
      
          const existingproduct = await Product.findOne({ model: item.model });
          if(existingproduct) errors.push({ index, error: "The modelNumber " +item.model+" already exists."})
      })    
  
      if(errors.length > 0) return Handle(resp,400,'Validation errors occurred.',null,errors);
  
      const result = await Product.insertMany(updateditems);
      return Handle(resp,201,'All products are added successfully',result)
    } catch (error) {
      return Handle(resp,500,'Internal Server Error',null,error);
      }
})

Routes.get("/getallcitiesandstates",checkuserdetails,async(req,resp)=>{
  try {
   const response=await fetch("https://city-state.netlify.app/index.json")
   const result=await response.json()
   if(response.status===200 && result.length!==0) return Handle(resp,202,"Cities & States fetched successfully",result)
   return Handle(resp,400,"Cities & States are not fetched successfully")
  } catch (error) {
   return Handle(resp,500,"Internal Server error",null,error)
  }
})




Routes.post("/verifyexecutive",checkuserdetails,async (req, resp) => {
  try {
    const { name, phone, email, password, address, city, state } = req.body;

    if (!name || !phone || !email || !password || !city || city==="None" || !address || !state || state==="None") return HandleResponse(resp,404,"Field is Empty")

    const existinguser = await User.findOne({ email });
    if (existinguser) return HandleResponse(resp,400,"Account already exists")

    const otp = generateotp(email);
    return await otptoemailforverification(resp, email, otp);
  } catch (error) {
    return HandleResponse(resp,500,"Internal Server Error",null,error);
  }
});
Routes.post("/createexecutive",checkuserdetails,async (req, resp) => {
  try {
    const { name, phone, email, address, password, city, state, otp } =req.body;

    if (!name || !phone || !email || !address || !city || city==="None" || !state || state==="None" || !password) return HandleResponse(resp,404,"Field is Empty")

    if (!otp) return Handle(resp,404,"Enter the otp");

    const existinguser = await User.findOne({ email });
    if (existinguser) return Handle(resp,400,"Account already exists")

    const response = verifyotp(email, otp);
    if (!response.status) return Handle(resp,404,response.message);

    const result = await Executive.create({name,phone,email,password,address,city,state,executiveof:req.user._id});
    return Handle(resp,201,"Account created successfully",result);
  } catch (error) {
       return Handle(resp,500,"Internal Server error",null,error)
  }
});
Routes.get("/getallexecutives",checkuserdetails,async(req,resp)=>{
  try {
    const users = await Executive.find({executiveof:req.user._id}).select("-password")
    if(users.length===0) return Handle(resp,400,"No user found")
    return Handle(resp,202,"Users fetched successfully",users)
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error)
  }
})
Routes.put("/enableexecutive",checkuserdetails, async (req, resp) => {
  try {
    const { id } = req.body;
    if (!id) return Handle(resp,404,"Plz Select the Executive");

    const existinguser = await Executive.findOne({ _id: id });
    if (!existinguser) return Handle(resp,404,"Executive is not found");

    const result = await Executive.updateOne({ _id: id },{ $set: { service: true } });
    return Handle(resp,202,"Service is enabled",result)
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error)
  }
});
Routes.put("/disableexecutive",checkuserdetails, async (req, resp) => {
  try {
    const { id } = req.body;
    if (!id) return Handle(resp,404,"Plz Select the Executive");

    const existinguser = await Executive.findOne({ _id: id });
    if (!existinguser) return Handle(resp,404,"Executive is not found");

    const result = await Executive.updateOne({ _id: id },{ $set: { service: false } });
    return Handle(resp,202,"Service is disabled",result)
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error)
  }
});

Routes.post("/createcustomer",checkuserdetails,async(req,resp)=>{
  try {
    const {name,phone,address}=req.body
    if(!name || !phone ||!address) return Handle(resp,404,"Field is Empty")
    const existingcustomer=await Customer.findOne({phone,customerof:req.user._id})
    if(existingcustomer) return Handle(resp,400,"Customer Already Exists")
    const newCustomer=await Customer.create({name,phone,address,customerof:req.user._id})
    return Handle(resp,201,"Customer created successfully",newCustomer)
  } catch (error) {
    return Handle(resp,500,"Internal Server Error",null,error)  
  }
})
Routes.get("/getallcustomers",checkuserdetails,async(req,resp)=>{
  try {
    const existingcustomers=await Customer.find({customerof:req.user._id})
    if(!existingcustomers || existingcustomers.length===0) return Handle(resp,404,"Customer list is empty")
    return Handle(resp,202,"Customers fetched successfully",existingcustomers)
  } catch (error) {
    return Handle(resp,500,"Internal Server Error",null,error)  
  }
})
async function generateInvoiceNumber(shopkeeperId) {
  const lastInvoice = await Invoice.findOne({shopkeeperId}).sort({ _id: -1 });

  let newInvoiceNumber;
  if (lastInvoice) {
    let lastNumber = parseInt(lastInvoice.InvoiceNo.split('-')[1]) + 1;
    newInvoiceNumber = `INV-${lastNumber.toString().padStart(5, '0')}`;
  } else {
    newInvoiceNumber = 'INV-00001';
  }

   return newInvoiceNumber;
}

const validateordereditems = (object) => {
 if(Object.keys(object).length===0) return "Product Detail not found";
 if(!object.id || object.id==="" || object.id==null || !mongoose.isValidObjectId(object.id)) return "Product id is invalid";
 if(!object.quantity || object.quantity==="" || object.quantity===null || object.quantity<=0) return "Product quantity is invalid";
 return null;
};
Routes.post("/createInvoice/:id",checkuserdetails,async(req, resp) => {
 try {
  const {id} =req.params
 if(!id || !mongoose.isValidObjectId(id)) return HandleResponse(resp,404,"Customer is not valid")
 const existingCustomer=await Customer.findOne({_id:id})
 if(!existingCustomer) return HandleResponse(resp,404,"Customer not found")

  const {ordereditems}=req.body
  if(!ordereditems) return HandleResponse(resp,404,"Select the items")
  if (!Array.isArray(ordereditems) || ordereditems.length === 0) return HandleResponse(resp,400,'Invalid input. Provide an array of items.')
  
  const errors=[]
  ordereditems.map(async(item,index)=>{
    const validationError = validateordereditems(item);
    if (validationError) errors.push({ index, error: validationError })
  })
  if(errors.length > 0) return HandleResponse(resp,400,'Validation errors occurred.',null,errors);
  
  const allids= ordereditems.map(item=>new mongoose.Types.ObjectId(item.id))
  const allproducts=await Product.find({_id:{$in:allids}})
  if(allids.length!==allproducts.length) return  HandleResponse(resp,404,"One or More Products is missing")


  for(const item of ordereditems){
    const existingProduct= await Product.findOne({_id:item.id,userid:req.user._id})
    if(existingProduct.stock<item.quantity) return HandleResponse(resp,404,"Stock of this product:"+existingProduct.name+"is insufficient")
  }

  const newOrder=[]
  for(const item of ordereditems){
   const existingProduct= await Product.findOne({_id:item.id,userid:req.user._id})

    existingProduct.stock-=item.quantity
    await existingProduct.save()

   const {name,model,company,description,rate,price,tax,discount}= existingProduct
   const obj={name,model,company,description,rate,price,tax,discount,quantity:item.quantity,subtotal:price*item.quantity}
   newOrder.push(obj)
  }

  let totaltax=0
  let totaldiscount=0
  let totalcost=0
  let subtotal=0
  for(const item of newOrder){
    totaltax+=item.quantity*((item.price*item.tax)/100)
    totaldiscount+=item.quantity*((item.price*item.discount)/100)
    subtotal+=item.quantity*item.price
    totalcost+=item.quantity*item.rate
  }
  const grandtotal=subtotal-totaldiscount+totaltax
  const totalprofit=grandtotal-totalcost-totaldiscount-totaltax

  const orders=await OrderedItems.insertMany(newOrder)
  const allid=orders.map(obj=>obj._id)
  const invoiceNumber = await generateInvoiceNumber(req.user._id);

  existingCustomer.balance+=parseInt(grandtotal)
  await existingCustomer.save()

  const result = await Invoice.create({InvoiceNo: invoiceNumber,OrderItems:allid,TotalAmount:parseInt(grandtotal),Subtotal:subtotal,TotalProfit:totalprofit,TotalDiscount:totaldiscount,TotalTax:totaltax,customerId:id,shopkeeperId:req.user._id});
  // const resultingItems=await OrderedItems.find({_id:{$in:allid}})
  return HandleResponse(resp,201,'Invoice generated successfully',{result,ordereditems:newOrder});
 } catch (error) {  
  return HandleResponse(resp,500,"Internal Server Error",null,error)
 }
})

Routes.get("/getCustomer/:id",checkuserdetails,async(req,resp)=>{
  try {
    const {id}=req.params
    if(!id || !mongoose.isValidObjectId(id)) return HandleResponse(resp,404,"Customer is not valid")
      
    const existingCustomer=await Customer.findOne({_id:id,customerof:req.user._id})
    if(!existingCustomer) return HandleResponse(resp,404,"Customer is not found in your list")
    return HandleResponse(resp,202,"Customer fetched successfully",existingCustomer)
  } catch (error) {
    return HandleResponse(resp,500,"Internal Server Error",null,error)
  }
})
Routes.get("/getShopkeeper",checkuserdetails,async(req,resp)=>{
  try {
    const existingShopkeeper=await Shopkeeper.findOne({_id:req.user._id}).select("-password -_id")
    if(!existingShopkeeper) return HandleResponse(resp,404,"Shopkeeper is not found in your list")
    return HandleResponse(resp,202,"Shopkeeper fetched successfully",existingShopkeeper)
  } catch (error) {
    return HandleResponse(resp,500,"Internal Server Error",null,error)
  }
})

Routes.get("/getalltransactions/:id",checkuserdetails,async(req,resp)=>{
  try {
    const {id} =req.params
    if(!id || !mongoose.isValidObjectId(id)) return HandleResponse(resp,404,"Customer is not valid")

    const existingCustomer=await Customer.findOne({_id:id})
    if(!existingCustomer) return HandleResponse(resp,404,"Customer not found")

    const result=await Transaction.find({shopkeeperId:req.user._id,customerId:id})
    if(!result || result.length === 0) return HandleResponse(resp,404,"Transaction list is empty")
    return HandleResponse(resp,202,"Transactions fetched successfully",result)
  } catch (error) {
    return HandleResponse(resp,500,"Internal Server Error",null,error)
  }
})

Routes.post("/addpayment/:id",checkuserdetails,async(req,resp)=>{
  try {
    const {RecieptNo,payment,Description}=req.body
    if(!RecieptNo || !payment) return HandleResponse(resp,404,"Field is Empty")

    const {id}=req.params
    if(!id ||!mongoose.isValidObjectId(id)) return HandleResponse(resp,404,"Customer is not valid")
    
    const existingCustomer=await Customer.findOne({_id:id,customerof:req.user._id})
    if(!existingCustomer) return HandleResponse(resp,404,"Customer is not found in your list")


    existingCustomer.balance-=payment
    const updatedCustomer=await Customer.updateOne({_id:id,customerof:req.user._id},{$set:{balance:existingCustomer.balance}})
    const result=await Payment.create({shopkeeperId:req.user._id,customerId:id,RecieptNo,payment,Description})
    return HandleResponse(resp,201,"Customer updated successfully",{updatedCustomer,result})
  } catch (error) {
    return HandleResponse(resp,500,"Internal Server Error",null,error)
  }
})
module.exports = Routes;
