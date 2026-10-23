import { db } from '../lib/db.js';
export async function notify(userId,title,message){if(userId)await db.notification.create({data:{userId,title,message}});}
export async function history(ticketId,actorId,action,details={}){await db.ticketHistory.create({data:{ticketId,actorId,action,details}});}
