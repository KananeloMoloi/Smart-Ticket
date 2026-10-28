import { HttpError } from './errors.js';
export const ticketInclude={createdBy:{select:{id:true,name:true,email:true}},assignedTo:{select:{id:true,name:true}},department:true,attachments:true};
export function visibility(user){return user.role==='USER'?{createdById:user.id}:user.role==='AGENT'?{OR:[{assignedToId:user.id},{createdById:user.id}]}:{};}
export function ensureAccess(user,ticket){
 if(user.role==='ADMIN'||ticket.createdById===user.id) return;
 if(user.role==='AGENT'&&ticket.assignedToId===user.id)return;
 throw new HttpError(403,'Ticket access denied');
}
export function canManage(user,ticket){if(user.role==='ADMIN'||(user.role==='AGENT'&&ticket.assignedToId===user.id))return;throw new HttpError(403,'Ticket management denied');}
export const transitions={OPEN:['IN_PROGRESS','CLOSED'],IN_PROGRESS:['RESOLVED','OPEN'],RESOLVED:['CLOSED','REOPENED'],CLOSED:['REOPENED'],REOPENED:['IN_PROGRESS','CLOSED']};
