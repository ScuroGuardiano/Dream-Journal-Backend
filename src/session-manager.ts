import * as Sequelize from 'sequelize';

export class SessionExpiredError extends Error {
    constructor() {
        super("Session expired");
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class SessionNotFoundError extends Error {
    constructor() {
        super("Session not found");
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export interface ISessionAttributes {
    id?: string;
    data?: string;
    expire: number;
    createdAt?: string;
    updatedAt?: string;
}

export type ISessionInstance = Sequelize.Instance<ISessionAttributes> & ISessionAttributes;

export interface ISessionManagerOptions {
    /** After how many miliseconds session is expired, default 24h */
    expireTime?: number;
    /** Path to storage db, default "./session.sqlite" */
    storagePath?: string;
    /** After how many miliseconds session is expired after session renew, default 1h */
    renewTimestamp?: number;
}
const defaultSettings: ISessionManagerOptions = {
    expireTime: 24 * 60 * 60 * 1000,
    storagePath: './sessions.sqlite',
    renewTimestamp: 1 * 60 * 60
};
Object.freeze(defaultSettings);

export default class SessionManager {
    private constructor(options: ISessionManagerOptions, storage: Sequelize.Sequelize, model: Sequelize.Model<ISessionInstance, ISessionAttributes>) {
        this.settings = options;
        this.storage = storage;
        this.model = model;
    }
    public static async init(options = defaultSettings) {
        let customOptions = options;
        options = Object.assign({}, defaultSettings);
        Object.assign(options, customOptions);

        let sessionStorage = new Sequelize("mainDB", null, null, {
            dialect: "sqlite",
            storage: options.storagePath,
            logging: false
        });
        let sessionModel = sessionStorage.define<ISessionInstance, ISessionAttributes>('Session', {
            id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
            data: { type: Sequelize.JSON },
            expire: { type: Sequelize.INTEGER }
        });
        await sessionStorage.sync({force: false});
        return new SessionManager(options, sessionStorage, sessionModel);
    }
    
    /**
     * Create session and return session token
     * @param data session data
     */
    public async createSession(data?: any): Promise<string> {
        let session = await this.model.create({
            data: JSON.stringify(data || null),
            expire: Date.now() + this.settings.expireTime
        })
        if(session)
            return session.id;
        else {
            throw new Error("Something went wrong, and I don't know what xD");
        }
    }
    /**
     * Finds session and if it's valid returns session data  
     * If session is expired throws SessionExpiredError  
     * If session doesn't exists throws SessionNotFoundError
     * @param token session token
     */
    public async retrieveSession(token: string): Promise<any> {
        let session = await this.model.findOne({
            where: { id: token }
        });
        if(!session)
            throw new SessionNotFoundError();
        if(!this.validateSession(session))
            throw new SessionExpiredError();
        if(session.data) {
            let sessionData = JSON.parse(session.data);
            return sessionData;
        }
        return null;
    }
    /**
     * Updates & renews session with specified token  
     * Doesn't check if session is valid  
     * If session doesn't exists throws SessionNotFoundError
     * @param token session token
     * @param data session data
     */
    public async updateSession(token: string, data?: any) {
        let session = await this.model.findOne({
            where: { id: token }
        });
        if(session) {
            session.data = JSON.stringify(data || null);
            this.renewSessionInstance(session);
            await session.save();
            return true;
        }
        else throw new SessionNotFoundError();
    }
    /** 
     * Renews session with specified token whenever it's valid or not  
     * If session doesn't exits throws SessionNotFoundError
     * @param token session token
    */
    public async renewSession(token: string) {
        let session = await this.model.findOne({
            where: { id: token }
        });
        if (session) {
            this.renewSessionInstance(session);
            await session.save();
            return true;
        }
        else throw new SessionNotFoundError();
    }
    /** 
     * Removes session with specified token  
     * If session doesn't exits do nothing, you want to delete it, so who cares if it exists? XD
     * */
    public async removeSession(token: string) {
        await this.model.destroy({
            where: { id: token }
        });
    }
    /**
     * Removes all expired sessions, returns amount of deleted sessions
     */
    public async removeExpiredSessions() {
        let deleted = await this.model.destroy({
            where: { expire: {
                [Sequelize.Op.lt]: Date.now()
            } }
        });
        return deleted;
    }

    /** Renews session instance, doesn't save */
    private renewSessionInstance(session: ISessionInstance) {
        //No need for renewing if session expire time is higher than renew timestamp
        if((Date.now() - session.expire) > this.settings.renewTimestamp)
            return true;
        session.expire = Date.now() + this.settings.renewTimestamp;
        return true;
    }
    private validateSession(session: ISessionInstance): boolean {
        return (session.expire - Date.now()) > 0;
    }

    private settings: ISessionManagerOptions;
    private model: Sequelize.Model<ISessionInstance, ISessionAttributes>
    private storage: Sequelize.Sequelize;
}
