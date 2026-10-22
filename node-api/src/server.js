import 'dotenv/config';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Set a JWT_SECRET of at least 32 characters');
import { app } from './app.js';import { db } from './lib/db.js';
const port=Number(process.env.PORT)||4000;const server=app.listen(port,()=>console.log(`Node API listening on ${port}`));
const shutdown=async()=>{server.close();await db.$disconnect();process.exit(0)};process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
