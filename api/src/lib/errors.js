export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export const asyncHandler = fn => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export function errorHandler(err,req,res,next){
 if(err?.code==='P2002') return res.status(409).json({error:'A unique value already exists'});
 if(err?.code==='P2025') return res.status(404).json({error:'Resource not found'});
 if(err?.name==='ZodError') return res.status(400).json({error:'Validation failed',details:err.flatten()});
 if(err?.name==='MulterError') return res.status(400).json({error:err.message});
 const status=err.status||500;
 if(status>=500) console.error(err);
 res.status(status).json({error:status>=500?'Internal server error':err.message});
}
