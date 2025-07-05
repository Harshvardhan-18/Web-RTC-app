import {Schema,model} from "mongoose";
import mongoose from "mongoose";
import { MONGO_URL } from "./config";

mongoose.connect(MONGO_URL);

const UserSchema= new Schema({
    username:{type:String,unique:true},
    email:{type:String,unique:true},
    password:String
})
export const UserModel=model("User",UserSchema)