import { Router } from "express";
import { login, signup } from "./auth.service.js";
import { succesResponse } from "../../common/enums/utils/response.js";
const router = Router();
router.post("/signup", async (req, res, next)=> {
    const account  = await signup(req.body)
    return succesResponse({res , status: 201, data: {account}})
})
router.post("/login", async (req, res, next)=> {
    const account  = await login(req.body)
    return succesResponse({res , status: 201, data: {account}})
})