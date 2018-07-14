import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import apiRouter from './routers/api';
import IAppServices from './interfaces/iapp-services';

export default class DarkServer {
    public constructor(services: IAppServices) {
        this.app = express();

        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.app.use('/api', apiRouter(services));

        this.app.use((req, res) => {
            return res.status(404).json("404 - Not Found");
        })
    }
    public run(port = 3000, host = "0.0.0.0") {
        this.app.listen(port, host, () => {
            console.log(`App is listening on ${host}:${port}!`);
        });
    }
    private app: express.Express;
}
