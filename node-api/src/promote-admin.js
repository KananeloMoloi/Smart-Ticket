import 'dotenv/config';import { db } from './lib/db.js';
const email=process.argv[2];if(!email)throw new Error('Usage: node src/promote-admin.js user@example.com');
try{const u=await db.user.update({where:{email:email.toLowerCase()},data:{role:'ADMIN'},select:{id:true,email:true,role:true}});console.log(u);}finally{await db.$disconnect();}
