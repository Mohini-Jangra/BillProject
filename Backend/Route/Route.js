const express= require("express")
const {generateotp, verifyotp}= require("../Services/OtpService/Otp")
const { User, Shopkeeper } = require("../Model/UserModel/UserModel")
const { otptoemailforverification } = require("../Services/EmailService/Email")
const Handle = require("../HandleResponse/HandleResponse")
const Product= require("../Model/ProductModel/Product")
const checkuserdetails = require("../MiddleWare/CheckUser")
const jwt= require("jsonwebtoken")
const Routes= express.Router()

Routes.get("/Health", (req,resp) => {
   return resp.status(200).json({message:"Everything is going right way"})
})
try {
    Routes.post("/verifyshopkeeper",async (req,resp) => {
        const {name,phone,city,state,email,address,password}=req.body
    if(!name || !phone ||!email || !address || !city || !state ||!password) return resp.status(404).send({message:"Filed is empty. Recheck it."})
     
        const existinguser= await User.findOne({email})
        if(existinguser) return Handle(resp,404,"Email already exists. Please recheck and retry")
    
            const otp= generateotp(email)
            return await otptoemailforverification(resp,email,otp)
    })
} catch (error) {
 return Handle(resp,500,"Internal server error.",null,error)   
}

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
    return Handle(resp,202,"login successfully",token)
    }
    return Handle(resp,401,"Invalid Password");
  } catch (error) {
    return Handle(resp,500,"Internal Server error",null,error);
  }
});
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

module.exports=Routes