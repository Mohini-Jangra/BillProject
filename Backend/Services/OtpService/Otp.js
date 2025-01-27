const crypto=require("crypto")
const otpmap=new Map()

const generateotp=(email)=>{
    const number= crypto.randomInt(0,1000000)
    const otp=String(number).padStart(6,"7")
    otpmap.set(email,otp)
    return otp
}


const verifyotp=(email,otp)=>{
    const otpverify= otpmap.get(email) 
       if(!otpverify) return {status:false,message:"OTP is not found or expired"}
    if(otpverify===otp){
    otpmap.delete(email);
    return {status:true,message:"Otp Matched Successful"}
    }
    return {status:false,message:'Invalid OTP'}
    // console.log(otpverify)
    
}

module.exports={generateotp,verifyotp}