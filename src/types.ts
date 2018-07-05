import * as express from 'express';

export type DarkRequest = express.Request & { session: { [key: string]: any } }