const mongoose= require("mongoose")

const baseSchema= new mongoose.Schema(
    {
        name:{
         type:String,
         required:true,     
        },
        phone:{
            type:Number,
            required:true,

        },
        city:{
            type:String,
            required:true,

        },
        email:{
            type:String,
            required:true,
            unique:true

        },
        password:{
            type:String,
            required:true,

        },
        address:{
            type:String,
            required:true,

        },
        state:{
            type:String,
            required:true,

        },
        service:{
            type:Boolean,
            default:true,

        },
        role:{
            type:String,
            required:true,
            enum:["shopkeeper","executive"]
        },
        date:{
            type:Date,
            default:Date.now
        }
    },
    {discriminatorKey:"role",collection:process.env.MONGODB_USER_COLLECT}
);
const User=mongoose.model(process.env.MONDODB_USER_COLLECT,baseSchema);

const ShopkeeperSchema= new mongoose.Schema({

});
const ExecutiveSchema= new mongoose.Schema({
    executiveof:{
        type:String,
        required:true
    }
});
const Shopkeeper =User.discriminator("Shopkeeper",ShopkeeperSchema);
const Executive =User.discriminator("Executive",ExecutiveSchema);

module.exports={User,Shopkeeper,Executive}