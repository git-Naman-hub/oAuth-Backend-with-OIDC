import { application } from "express"
import {email, z} from "zod"

export const signupPayloadModel = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2).nullable().optional(),
    email: z.email(),
    password: z.string().min(6)
})

export const singinPayloadModel = z.object({
    email: z.email(),
    password: z.string().min(6)
})

export const registerPayloadModel = z.object({
    applicationName: z.string(),
    applicationUrl: z.url().refine((url) => { 
        return url.startsWith("http://") || url.startsWith("https://"); }, 
        { message: "Only HTTP/HTTPS URLs are allowed" }),
    redirectUri: z.url().refine((url) => { 
        return url.startsWith("http://") || url.startsWith("https://"); }, 
        { message: "Only HTTP/HTTPS URLs are allowed" })
})

export const tokenPayloadModel = z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    code: z.string()
})