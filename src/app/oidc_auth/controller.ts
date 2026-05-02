import type { Request,Response } from "express"
import "dotenv/config"
import fs from "fs"
import path from "path";
//@ts-ignore
import jose from "node-jose"
import { cwd } from "process";
import { registerPayloadModel, signupPayloadModel, singinPayloadModel, tokenPayloadModel } from "./model";
import { error } from "console";
import { db } from "../../db";
import { applicationsTable, authorizeCodesTable, usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { createHmac, randomBytes } from "crypto";
import { generateClientId, generateClientSecret, generateHash, generateToken, tokenPayload, verifyToken } from "../utils/secrets";


declare module "express-session"{
    interface SessionData{
        userId: string
    }
}

class oidcAuthController{
    public async handleWellknown(req:Request,res:Response){
        const issuer = `http://localhost:${process.env.PORT}`
        return res.json({
            issuer,
            authorization_endpoint:`${issuer}/auth/authorize`,
            userinfo_endpoint:`${issuer}/auth/user-info`,
            jwks_uri:`${issuer}/.well-known/public-keys`,
            token_endpoint:`${issuer}/auth/tokens`
        })
    }

    public async handlePublicKeys(req:Request,res:Response){
        const keystore = jose.JWK.createKeyStore();
        const publicKeyPath = path.resolve(process.cwd(),'keys/public.pem')
        const publicKey = fs.readFileSync(publicKeyPath,"utf-8")

        await keystore.add(publicKey, "pem", {
            kid: "oidc_pub_key_ID",   // choose any string (IMPORTANT later)
            use: "sig",
            alg: "RS256",
        });
        return res.json(keystore.toJSON())
    }

    public async getSignUpPage(req:Request,res:Response){
        const htmlPath = path.resolve(process.cwd(),'public/signup.html')
        res.sendFile(htmlPath)
    }

    public async handleSignup(req:Request,res:Response){
        const validationResult = await signupPayloadModel.safeParseAsync(req.body)
        if(validationResult.error) return res.status(400).json({message:"Body validation failed.",error:validationResult.error});
        const {firstName,lastName,email,password} = validationResult.data
        //check for email in db
        const [userEmailResult] = await db.select().from(usersTable).where(eq(usersTable.email,email))
        if(userEmailResult) return res.status(400).json({error:"duplicate entry",message:`User with email ${email} already exists.`});
        //hash the password
        const salt = randomBytes(32).toString('hex')
        const hash = createHmac('sha256',salt).update(password).digest('hex')
        const [result] = await db.insert(usersTable).values({
            firstName,
            lastName,
            email,
            password:hash,
            salt
        }).returning({id:usersTable.id})
        return res.redirect('/auth/sign-in')

    }

    public async getSignIn(req:Request,res:Response){
        const htmlPath = path.resolve(process.cwd(),'public/authenticate.html')
        res.sendFile(htmlPath)
    }

    public async handleSignIn(req:Request,res:Response){
        const validationResult = await singinPayloadModel.safeParseAsync(req.body)
        if(validationResult.error) return res.status(401).json({message:"Invalid credentials",error:validationResult.error});
        const {email,password} = validationResult.data
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email,email))
        if(!user) return res.status(401).json({error:`User with email ${email} does not exist.`});
        const salt = user.salt
        const hash = createHmac('sha256',salt!).update(password).digest('hex')
        if(user.password!==hash) return res.status(401).json({error:"Invalid email or password."});
        //create session
        req.session.userId=user.id
        return res.status(200).json({message:"Login successful."})

    }

    public async handleRegister(req:Request,res:Response){
        const validationResult = await registerPayloadModel.safeParseAsync(req.body)
        if(validationResult.error) return res.status(400).json({message:"Validation failed.",error:validationResult.error});
        const {applicationName,applicationUrl,redirectUri}=validationResult.data
        const clientId = await generateClientId()
        const clientSecret = await generateClientSecret()
        const {hash,salt} = await generateHash(clientSecret)
        const [result] = await db.insert(applicationsTable).values({
            userId:req.session.userId!,
            clientId,
            clientSecret:hash,
            applicationName,
            applicationUrl,
            redirectUri,
            salt
        }).returning({id:applicationsTable.id})
        return res.status(200).json({
            id:result?.id,
            clientId,
            clientSecret
        })
        
    }

    public async getAuthorize(req:Request,res:Response){
        const clientId = req.query.clientId as string
        const [applicationResult] = await db.select().from(applicationsTable).where(eq(applicationsTable.clientId,clientId))
        if(!applicationResult) return res.status(404).json({error:"You are not authorized for this."});
        const code = randomBytes(8).toString('hex')
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000)
        const [result] = await db.insert(authorizeCodesTable).values({
            code,
            clientId,
            userId: applicationResult.userId,
            redirectUri: applicationResult.redirectUri,
            expiresAt: expiresAt
        }).returning({id:authorizeCodesTable.id})
        return res.status(200).json({id:result?.id,code,redirectUri:applicationResult.redirectUri})
    }

    public async handleTokens(req:Request,res:Response){
        const validationResult= await tokenPayloadModel.safeParseAsync(req.body)
        if(validationResult.error) return res.status(400).json({message:"Validation failed.",error:validationResult.error});
        const {clientId,clientSecret,code} = validationResult.data
        const [applicationResult] = await db.select().from(applicationsTable).where(eq(applicationsTable.clientId,clientId))
        if(!applicationResult) return res.status(404).json({error:"You are not an authorized client."});
        const salt = applicationResult.salt
        const hash = createHmac('sha256',salt!).update(clientSecret).digest('hex')
        if(applicationResult.clientSecret!==hash) return res.status(404).json({error:"You are not authorized."});
        const [codeResult] = await db.select().from(authorizeCodesTable).where(eq(authorizeCodesTable.code,code))
        const now = Math.floor(Date.now() / 1000)
        if(new Date() > codeResult?.expiresAt!){
            await db.delete(authorizeCodesTable).where(eq(authorizeCodesTable.code,code))
            return res.status(400).json({error:"Session expired."})
        }
        //@ts-ignore
        const [user] = await db.select().from(usersTable).where(eq(req.session.userId,usersTable.id))
        const payload: tokenPayload = {
             iss:`http://localhost:${process.env.PORT}`,
             sub: applicationResult.userId,
             email: user?.email!,
             emailVerified: user?.emailVerified!,
             exp: now + 3600, //1hr,
             givenName: user?.firstName!,
             familyName: user?.lastName!
        }
        const token = await generateToken(payload)
        await db.delete(authorizeCodesTable).where(eq(authorizeCodesTable.code,code))
        return res.status(200).json({message:"You are authorized.",token})
    }

    public async handleUserInfo(req:Request,res:Response){
        const header = req.headers['authorization']
        if(!header) return res.status(400).json({error:'Token is missing'});
        if(!header.startsWith('Bearer ')) return res.status(401).json({error:"Authorization header must start with Bearer"});
        const token = header.split(" ")[1]
        if(!token) return res.status(401).json({error:"Authorization header must start with Bearer followed by token"});
       try {
        const payload = await verifyToken(token)
        const {sub,givenName,email,familyName} = payload
        return res.status(200).json({
            id:sub,
            firstName:givenName,
            lastName:familyName,
            email:email
        })
       } catch (error) {
         return res.status(404).json({error})
       }
    }
}

export default oidcAuthController