import { Router } from "express";
import RegisterError, { RegisterErrorCodes } from "../errors/register-error";
import LoginError, { LoginErrorCodes } from "../errors/login-error";
import formatDream from "./helpers/format-dream";
import IAppServices from "../interfaces/iapp-services";

export default function createApiRouter({sessionManager, userService, dreamService}: IAppServices) {
    let router: Router = Router();

    router.get('/isLoggedIn', async (req, res) => {
        try {
            if (req.headers['X-Dark-Token']) {
                try {
                    let session = await sessionManager.retrieveSession(<string>req.headers['X-Dark-Token']);
                    if(session && session.userId)
                        return res.status(200).json({
                            result: true
                        });
                }
                catch { }
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
            if (req.body.email && req.body.password) {
                try {
                    let user = await userService.registerUser(req.body.email, req.body.password)
                    let token = await sessionManager.createSession({
                        userId: user.id
                    });
                    return res.status(200).send({
                        token: token
                    });
                }
                catch (err) {
                    if (err instanceof RegisterError) {
                        let error: string = '';
                        switch (err.code) {
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
            if (req.body.email && req.body.password) {
                try {
                    let user = await userService.authenticateUser(req.body.email, req.body.password);
                    let token = await sessionManager.createSession({
                        userId: user.id
                    });
                    return res.status(200).send({
                        token: token
                    });
                }
                catch (err) {
                    if (err instanceof LoginError) {
                        let error: string = '';
                        let errorCode: string = '';
                        switch (err.code) {
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
    router.get('/logout', async (req, res) => {
        try {
            if (req.headers['x-dark-token']) {
                await sessionManager.removeSession(<string>req.headers['x-dark-token']);
            }
        }
        catch {}
        finally {
            //If it succeed or not, who cares?
            //Just delete session token from client :)
            return res.status(204);
        }
    });
    //Below this line session is needed XD

    //Session checker & renewer
    router.use(async (req, res, next) => {
        try {
            if (req.headers['x-dark-token']) {
                let token = <string>req.headers['x-dark-token'];
                let tokenData = null;
                try {
                    tokenData = await sessionManager.retrieveSession(token);
                }
                catch { }
                if (tokenData) {
                    if (await userService.checkSession(tokenData.userId)) {
                        //Session valid, gut, we can go next
                        res.locals.userId = tokenData.userId;
                        res.locals.sessionToken = token;
                        return next();
                    }
                }
            }
            return res.status(401).send();
        }
        catch (err) {
            return res.status(500).json({
                error: "Uknown error"
            });
        }
    });
    router.get('/dreams', async (req, res) => {
        try {
            let limit = null;
            if (req.query.limit && Number.parseInt(req.query.limit) != NaN) {
                limit = Number.parseInt(req.query.limit);
            }
            let dreams = await dreamService.getDreamsList(res.locals.userId, limit);
            let contentLimit: number = null;
            if (req.query.contentLimit) {
                contentLimit = Number.parseInt(req.query.contentLimit);
                if (Number.isNaN(contentLimit))
                    contentLimit = null;
            }
            let dreamsToSend = dreams.map(dream => {
                return formatDream(dream, contentLimit);
            });
            return res.status(200).json({
                dreams: dreamsToSend
            });
        }
        catch {
            return res.status(500).json({
                error: "Uknown error"
            });
        }
    });
    router.delete('/dream/:id/delete', async (req, res) => {
        try {
            let deleted = await dreamService.deleteDream(res.locals.userId, req.params.id);
            if (deleted) {
                return res.status(204).send();
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
    router.put('/dream/:id/edit', async (req, res) => {
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
            if (!dream) {
                return res.status(404).send();
            }
            return res.status(200).json({
                dream: formatDream(dream)
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
            if (Number.isNaN(dreamNumber)) {
                return res.status(400).send();
            }
            let dream = await dreamService.getDreamByNumber(res.locals.userId, dreamNumber);
            if (!dream) {
                return res.status(404).send();
            }
            return res.status(200).json({
                dream: formatDream(dream)
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
                dream: formatDream(dream)
            });
        }
        catch {
            return res.status(500).json({
                error: "Uknown error"
            });
        }
    });
    return router;
}
