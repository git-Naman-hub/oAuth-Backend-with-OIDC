import type {Request,Response,NextFunction} from "express"

export function authenticate(){
    return function(req:Request,res:Response,next:NextFunction){
        if(!req.session.userId) return res.status(401).json({error:"Login is required."});
        next()
    }
}