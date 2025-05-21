import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { UserModel,  } from './store/schema.js';
const JWT_SECERT = "BJHGYGJKGY"
const app = express();

app.use(express.json())
app.use(cors())

app.post('/signup', async (req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
 
      const resposne = await  UserModel.findOne({
         email:email,
     })
     if(resposne){
         res.json("Email Already register !!")
     }
     else{   
          await UserModel.create({
     name:name,
     email:email,
     password:password,
    })
 
    res.json('Successfully Added');
     }
 })
 
 app.post('/signin',async (req,res)=>{
     const email = req.body.email;
     const password = req.body.password;
 
   const resposne = await  UserModel.findOne({
         email:email,
         password:password,
     })
 
     if(resposne){
         const token = jwt.sign({id:resposne._id},JWT_SECERT);
 
         res.json({token:token});
     }
     else{
         res.json({msg:'Incorrect email or password'})
     }
 })

app.post("/history",(req,res)=>{

})

export default app;