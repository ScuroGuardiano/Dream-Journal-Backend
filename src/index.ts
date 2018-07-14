import DarkServer from "./server";
import { initDB } from "./models";
import UserService from "./services/user-service";
import DreamService from "./services/dream-service";
import * as ServerSessions from 'server-sessions';
import ISessionData from "./interfaces/isession-data";

module.exports = class DarkCore {
    public constructor() {
        this.main();
    }
    private async main() {
        await initDB();
        this.sessionManager = await ServerSessions.init<ISessionData>();
        this.userService = new UserService();
        this.dreamService = new DreamService();
        new DarkServer({
            sessionManager: this.sessionManager,
            userService: this.userService,
            dreamService: this.dreamService
        }).run();
    }
    private userService: UserService;
    private dreamService: DreamService;
    private sessionManager: ServerSessions.SessionManager<ISessionData>;
}
