import express from "express"
import type { Express } from "express"
import { authRouter } from "./oidc_auth/routes"
import session from "express-session"

export function createApplication():Express{
    const app = express()

    //middlewares
    app.use(express.json())
    app.use(express.urlencoded())
    

    //middleware to create session and store it in cookie
    app.use(session({
        secret:'sessionsecretkey',
        resave: false,
        saveUninitialized: false,
        cookie:{
            maxAge: 10 * 60 * 1000,//10 min
            httpOnly: true
        }
    }))

    app.use('/',authRouter)

    app.get('/health',(req,res)=>{
        res.json({
            healthy:true,
            message:"Application is healthy."
        })
    })

    app.get('/',(req,res)=>{
        res.json({message:"Welcome to oidc implementation."})
    })

    return app
}