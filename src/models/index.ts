import * as Sequelize from 'sequelize';
import defineUser from './user';

let db = new Sequelize('mainDB', null, null, {
    dialect: "sqlite",
    storage: "./db.sqlite"
});


export const User = defineUser(db);

export async function initDB() {
    await db.sync({ force: false });
}