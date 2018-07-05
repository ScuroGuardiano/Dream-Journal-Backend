import { Router } from "express";
import { DarkRequest } from "../types";
import UserService from "../services/user-service";
import RegisterError, { RegisterErrorCodes } from "../errors/register-error";
import LoginError, { LoginErrorCodes } from "../errors/login-error";

let router = Router();
const userService = new UserService();

router.get('/isLoggedIn', async (req: DarkRequest, res) => {
    try {
        if(req.session.userId && await userService.checkSession(req.session.userId)) {
            return res.status(200).json({
                result: true
            });
        }
        else {
            req.session.reset();
            return res.status(200).json({
                result: false
            });
        }
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
})
router.post('/register', async (req: DarkRequest, res) => {
    try {
        req.session.reset(); //W razie gdyby użytkownik był zalogowany ;)
        if(req.body.email && req.body.password) {
            try {
                let user = await userService.registerUser(req.body.email, req.body.password)
                req.session.userId = user.id;
                return res.status(201).send();
            }
            catch(err) {
                if(err instanceof RegisterError) {
                    let error: string = '';
                    switch(err.code) {
                        case RegisterErrorCodes.INVALID_EMAIL_ADRESS:
                                error = "Adress email is invalid";
                                break;
                        case RegisterErrorCodes.EMAIL_ALREADY_USED:
                                error = "User already exists";
                                break;
                        case RegisterErrorCodes.PASSWORD_TOO_SHORT:
                                error = "Password is too short";
                                break;
                        default:
                            throw err;
                    }
                    return res.status(400).json({
                        error: error,
                        errorCode: "REGISTER-" + err.code
                    });
                }
                else throw err;
            }
        }
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
})
router.post('/login', async (req: DarkRequest, res) => {
    try {
        req.session.reset(); //W razie gdyby użytkownik był zalogowany ;)
        if(req.body.email && req.body.password) {
            try {
                let user = await userService.authenticateUser(req.body.email, req.body.password);
                req.session.userId = user.id;
                return res.status(204).send();
            }
            catch(err) {
                if(err instanceof LoginError) {
                    let error: string = '';
                    let errorCode: string = '';
                    switch(err.code) {
                        /* We don't want give info if user exists or not, so we need only one error response
                           when one of this errors occur*/
                        case LoginErrorCodes.USER_DOESNT_EXIST:
                        case LoginErrorCodes.WRONG_PASSWORD:
                            error = "Wrong email or password";
                            errorCode = "LOGIN-" + LoginErrorCodes.WRONG_EMAIL_OR_PASSWORD;
                            break;
                        default:
                            throw err;
                    }
                    return res.status(400).json({
                        error: error,
                        errorCode: errorCode
                    });
                }
                else throw err;
            }
        }
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
});
router.get('/logout', (req: DarkRequest, res) => {
    req.session.reset();
    return res.status(204);
})

export default router;
