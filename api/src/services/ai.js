import { db } from '../lib/db.js';
import { history } from './notify.js';
const categories=['Network','Hardware','Software','Access','Security','General'];
export async function analyzeTicket(ticketId){
 const ticket=await db.ticket.findUnique({where:{id:ticketId}});if(!ticket)return;
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
  let response;
  try{response=await fetch(`${process.env.AI_SERVICE_URL||'http://localhost:5000'}/analyze`,{method:'POST',headers:{'Content-Type':'application/json','X-Service-Token':process.env.AI_SERVICE_TOKEN||''},body:JSON.stringify({title:ticket.title,description:ticket.description}),signal:controller.signal});}finally{clearTimeout(timer);}
  if(!response.ok)throw new Error(`AI service HTTP ${response.status}`);
  const result=await response.json();
  if(!categories.includes(result.category)||!['LOW','MEDIUM','HIGH','CRITICAL'].includes(result.priority)||typeof result.reason!=='string'||!Array.isArray(result.suggestions))throw new Error('Invalid AI response');
  const department=await db.department.findFirst({where:{category:result.category}});
  await db.ticket.update({where:{id:ticketId},data:{category:result.category,priority:result.priority,aiReason:result.reason.slice(0,2000),aiSuggestions:JSON.stringify(result.suggestions.slice(0,5)),aiState:'COMPLETED',...(department?{departmentId:department.id}:{})}});
  await history(ticketId,null,'AI_ANALYZED',{category:result.category,priority:result.priority});
 }catch(err){console.error('AI analysis failed',ticketId,err.message);await db.ticket.update({where:{id:ticketId},data:{aiState:'FAILED'}});}
}
