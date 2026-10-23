import { Router } from 'express';import { z } from 'zod';import { db } from '../lib/db.js';import { authenticate } from '../middleware/auth.js';import { asyncHandler,HttpError } from '../lib/errors.js';
const r=Router();r.use(authenticate);
r.get('/',asyncHandler(async(req,res)=>res.json(await db.notification.findMany({where:{userId:req.user.id},orderBy:{createdAt:'desc'},take:100}))));
r.patch('/:id/read',asyncHandler(async(req,res)=>{const result=await db.notification.updateMany({where:{id:z.string().uuid().parse(req.params.id),userId:req.user.id},data:{read:true}});if(!result.count)throw new HttpError(404,'Notification not found');res.json({success:true});}));
export default r;
