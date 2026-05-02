import express from "express"
import type { Router } from "express"
import oidcAuthController from "./controller"
import { authenticate } from "../middleware/oidc_auth.middleware"

export const authRouter:Router = express.Router()

const controller = new oidcAuthController()

authRouter.get('/.well-known/openid-configuration',controller.handleWellknown.bind(controller))

authRouter.get('/.well-known/public-keys',controller.handlePublicKeys.bind(controller))

authRouter.get('/auth/sign-up',controller.getSignUpPage.bind(controller))
authRouter.post('/auth/sign-up',controller.handleSignup.bind(controller))

authRouter.get('/auth/sign-in',controller.getSignIn.bind(controller))
authRouter.post('/auth/sign-in',controller.handleSignIn.bind(controller))

authRouter.post('/register',authenticate(),controller.handleRegister.bind(controller))

authRouter.get('/auth/authorize',authenticate(),controller.getAuthorize.bind(controller))

authRouter.post('/auth/tokens',authenticate(),controller.handleTokens.bind(controller))

authRouter.get('/auth/user-info',authenticate(),controller.handleUserInfo.bind(controller))