import { NextFunction,Response,Request } from "express"
import  jwt  from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const useMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const token=req.headers.authorization; 
    const response=jwt.verify(token as string,JWT_SECRET);
    if(response){
        //@ts-ignore
        req.userId=response.id;
        next();
    }else{
        res.status(403).json({
            message:"You are not logged in"
        })
    }
    
}