import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as clientSessions from 'client-sessions';
import apiRouter from './routers/api';

export default class DarkServer {
    public constructor() {
        this.app = express();

        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(clientSessions({
            secret: "YDQBa4w1KQnbfdC7jTZavlroWTAMIkar31T4kPbXIIhjTs0RIEiWKuxL4b8a",
            cookieName: "session",
            activeDuration: 4 * 60 * 60 * 1000
        }));

        this.app.use('/api', apiRouter);
    }
    public run(port = 3000, host = "0.0.0.0") {
        this.app.listen(port, host, () => {
            console.log(`App is listening on ${host}:${port}!`);
        });
    }
    private app: express.Express;
}
