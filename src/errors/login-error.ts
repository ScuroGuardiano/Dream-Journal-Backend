import DarkError from "./dark-error";

export enum LoginErrorCodes {
    USER_DOESNT_EXIST = 1,
    WRONG_PASSWORD,
    WRONG_EMAIL_OR_PASSWORD,
    UKNOWN
}

export default class LoginError extends DarkError {
    constructor(message: string, code?: LoginErrorCodes) {
        super(message, code || LoginErrorCodes.UKNOWN);
    }
}