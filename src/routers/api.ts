import { Router } from "express";
import UserService from "../services/user-service";
import RegisterError, { RegisterErrorCodes } from "../errors/register-error";
import LoginError, { LoginErrorCodes } from "../errors/login-error";
import DreamService from "../services/dream-service";
import formatDream from "./helpers/format-dream";
import * as JWT from 'jsonwebtoken';
import config from './../config';


let router: Router = Router();
const userService = new UserService();
const dreamService = new DreamService();

router.get('/isLoggedIn', async (req, res) => {
    try {
        if(req.headers['X-Dark-Token']) {
            try {
                if(JWT.verify(<string>req.headers['X-Dark-Token'], config.jwtsecret)) {
                    return res.status(200).json({
                        result: true
                    });
                }
            }
            catch {}
        }
        return res.status(200).json({
            result: false
        });
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
})
router.post('/register', async (req, res) => {
    try {
        if(req.body.email && req.body.password) {
            try {
                let user = await userService.registerUser(req.body.email, req.body.password)
                let token = JWT.sign({
                    userId: user.id
                }, config.jwtsecret, { expiresIn: '1h' });
                return res.status(200).send({
                    token: token
                });
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
router.post('/login', async (req, res) => {
    try {
        if(req.body.email && req.body.password) {
            try {
                let user = await userService.authenticateUser(req.body.email, req.body.password);
                let token = JWT.sign({
                    userId: user.id
                }, config.jwtsecret, { expiresIn: '1h' });
                return res.status(200).send({
                    token: token
                });
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
//Below this line session is needed XD

//Session checker & renewer
router.use( async (req, res, next) => {
    try {
        if(req.headers['x-dark-token']) {
            let tokenData: any = null;
            try {
                tokenData = JWT.verify(<string>req.headers['x-dark-token'], config.jwtsecret);
            }
            catch { }
            if(tokenData) {
                if(await userService.checkSession(tokenData.userId)) {
                    //Session valid, gut, we can go next
                    res.locals.userId = tokenData.userId;
                    res.locals.newToken = JWT.sign({
                        userId: tokenData.userId
                    }, config.jwtsecret, {expiresIn: "1h"});
                    return next();
                }
            }
        }
        return res.status(401).send();
    }
    catch(err) {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
});
router.get('/dreams', async (req, res) => {
    try {
        let limit = null;
        if(req.query.limit && Number.parseInt(req.query.limit) != NaN ) {
            limit = Number.parseInt(req.query.limit);
        }
        let dreams = await dreamService.getDreamsList(res.locals.userId, limit);
        let contentLimit: number = null;
        if(req.query.contentLimit) {
            contentLimit = Number.parseInt(req.query.contentLimit);
            if(Number.isNaN(contentLimit))
            contentLimit = null;
        }
        let dreamsToSend = dreams.map(dream => {
            return formatDream(dream, contentLimit);
        });
        return res.status(200).json({
            dreams: dreamsToSend,
            token: res.locals.newToken
        });
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
});
router.delete('/dream/:id/delete', async(req, res) => {
    try {
        let deleted = await dreamService.deleteDream(res.locals.userId, req.params.id);
        if(deleted) {
            return res.status(200).json({
                token: res.locals.newToken
            });
        }
        else {
            return res.status(404).send();
        }
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
})
router.put('/dream/:id/edit', async(req, res) => {
    try {
        if (!req.body.dreamTitle || !req.body.dream) {
            return res.status(400).send();
        }
        let dream = await dreamService.editDream(
            res.locals.userId,
            req.params.id,
            req.body.dreamTitle,
            req.body.dream
        );
        if(!dream) {
            return res.status(404).send();
        }
        return res.status(200).json({
            dream: formatDream(dream),
            token: res.locals.newToken
        });
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
})
router.get('/dream/:id', async (req, res) => {
    try {
        let dreamNumber = Number.parseInt(req.params.id);
        if(Number.isNaN(dreamNumber)) {
            return res.status(400).send();
        }
        let dream = await dreamService.getDreamByNumber(res.locals.userId, dreamNumber);
        if(!dream) {
            return res.status(404).send();
        }
        return res.status(200).json({
            dream: formatDream(dream),
            token: res.locals.newToken
        });
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
})
router.post('/add-dream', async (req, res) => {
    try {
        if (!req.body.dreamTitle || !req.body.dream) {
            return res.status(400).send();
        }
        let dream = await dreamService.createDream(res.locals.userId, {
            title: req.body.dreamTitle,
            content: req.body.dream,
            date: req.body.dreamDate || Date.now()
        });
        return res.status(200).json({
            dream: formatDream(dream),
            token: res.locals.newToken
        });
    }
    catch {
        return res.status(500).json({
            error: "Uknown error"
        });
    }
});

export default router;
