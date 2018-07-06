import * as Sequelize from 'sequelize';
import defineUser, { IUserInstance, IUserAttributes } from './user';
import defineDream from './dream';

let db = new Sequelize('mainDB', null, null, {
    dialect: "sqlite",
    storage: "./db.sqlite"
});


const User = defineUser(db);
const Dream = defineDream(db);

//relations
User.hasMany(Dream, { as: "Dreams" });

export { User };
export { Dream };

export async function initDB() {
    await db.sync({ force: false });
}