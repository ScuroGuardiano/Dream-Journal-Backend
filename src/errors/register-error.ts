import DarkError from "./dark-error";

export enum RegisterErrorCodes {
    PASSWORD_TOO_SHORT = 1,
    INVALID_EMAIL_ADRESS,
    EMAIL_ALREADY_USED,
    UKNOWN
}

export default class RegisterError extends DarkError {
    constructor(message: string, code?: RegisterErrorCodes) {
        super(message, code || RegisterErrorCodes.UKNOWN);
    }
}