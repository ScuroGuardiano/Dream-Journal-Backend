import * as Sequelize from 'sequelize';

export interface IDreamAttributes {
    id?: string;
    number: number;
    title: string;
    content: string;
    date?: number;
    UserId?: string;
    createdAt?: string;
    updatedAt?: string;
}
export type IDreamInstance = Sequelize.Instance<IDreamAttributes> & IDreamAttributes;

export default function defineDream(db: Sequelize.Sequelize) {
    return db.define<IDreamInstance, IDreamAttributes>('Dream', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, unique: true, primaryKey: true},
        number: { type: Sequelize.INTEGER, allowNull: false },
        date: { type: Sequelize.INTEGER, defaultValue: Date.now() },
        title: { type: Sequelize.STRING, allowNull: false },
        content: { type: Sequelize.TEXT, allowNull: false }
    });
}