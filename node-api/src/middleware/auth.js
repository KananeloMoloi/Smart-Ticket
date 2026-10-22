import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import { HttpError,asyncHandler } from '../lib/errors.js';
export const authenticate=asyncHandler(async(req,res,next)=>{
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token) throw new HttpError(401,'Authentication required');
 let payload;try{payload=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});}catch{throw new HttpError(401,'Invalid or expired token');}
 const user=await db.user.findUnique({where:{id:payload.sub},select:{id:true,email:true,name:true,role:true,departmentId:true}});
 if(!user) throw new HttpError(401,'Account no longer exists');
 req.user=user;next();
});
export const requireRole=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():next(new HttpError(403,'Insufficient permissions'));
