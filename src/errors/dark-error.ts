export default class DarkError extends Error {
    constructor(message: string, code?: number) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.code = code | 0;
    }
    public code: number;
}