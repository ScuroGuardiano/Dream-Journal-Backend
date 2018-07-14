import { SessionManager } from "server-sessions";
import UserService from "../services/user-service";
import DreamService from "../services/dream-service";
import ISessionData from "./isession-data";

export default interface IAppServices {
    sessionManager: SessionManager<ISessionData>;
    userService: UserService;
    dreamService: DreamService;
}
