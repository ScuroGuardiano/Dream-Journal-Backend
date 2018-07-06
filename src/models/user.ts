import * as Sequelize from 'sequelize';

export interface IUserAttributes {
    id?: string,
    email: string,
    password: string,
    createdAt?: string,
    updatedAt?: string
};
export type IUserInstance = Sequelize.Instance<IUserAttributes> & IUserAttributes;

export default function defineUser(db: Sequelize.Sequelize) {
    return db.define<IUserInstance, IUserAttributes>('User', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, unique: true, primaryKey: true },
        email: { type: Sequelize.STRING, unique: true, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false }
    });
}