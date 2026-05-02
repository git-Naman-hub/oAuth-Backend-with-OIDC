import { randomBytes,createHmac } from "node:crypto";
import JWT, { JwtPayload } from "jsonwebtoken"
import path from "node:path"
import fs from "node:fs"

export interface tokenPayload{
    iss: string,
    sub: string,
    email: string,
    emailVerified: boolean,
    exp: number,
    givenName: string,
    familyName: string
}


export async function generateClientId(){
    const clientId = randomBytes(16).toString('hex')
    return clientId
}

export async function generateClientSecret(){
    const clientSecret = randomBytes(32).toString('hex')
    return clientSecret
}

export async function generateHash(payload:string){
    const salt = randomBytes(8).toString('hex')
    const hash = createHmac('sha256',salt).update(payload).digest('hex')
    return {hash,salt}
}

export async function generateToken(payload:tokenPayload){

    const PRIVATE_KEY_PATH = path.resolve(process.cwd(),'keys/private.pem')
    const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH,"utf-8")

    const token = JWT.sign(payload, PRIVATE_KEY, { algorithm: "RS256",keyid: "oidc_pub_key_ID"})
    return token
}

export async function verifyToken(token:string) {
    
    const PUBLIC_KEY_PATH = path.resolve(process.cwd(),'keys/public.pem')
    const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH,'utf-8')

    const payload = JWT.verify(token, PUBLIC_KEY, { algorithms: ["RS256"]}) as JwtPayload
    return payload
}