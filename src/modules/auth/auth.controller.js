import { Router } from "express";
import { login, signup } from "./auth.service.js";
import { succesResponse } from "../../common/utils/response/success.response.js";

const authRouter = Router();


authRouter.post("/signup", async (req, res, next) => {
    try {
        const account = await signup(req.body);
        return succesResponse({ res, status: 201, data: { account } });
    } catch (error) {
        next(error); 
    }
});


authRouter.post("/login", async (req, res, next) => {
    try {
        const credentials = await login(req.body);
        return succesResponse({ res, status: 200, data: { credentials } }); 
    } catch (error) {
        next(error);
    }
});

export default authRouter;