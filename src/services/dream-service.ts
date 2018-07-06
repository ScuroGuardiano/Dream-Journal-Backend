import IDreamData from "./idream-data";
import { Dream } from './../models';
import { IDreamInstance } from "../models/dream";

export default class DreamService {
    public async createDream(authorId: string, dreamData: IDreamData): Promise<IDreamInstance> {
        let dreamNumber = await this.getLastDreamNumber(authorId) + 1;
        let dream = await Dream.create({
            number: dreamNumber,
            title: dreamData.title,
            content: dreamData.content,
            date: dreamData.date,
            UserId: authorId
        })
        return dream;
    }
    public async getDreamByNumber(authorId: string, dreamNumber: number): Promise<IDreamInstance | null> {
        let dream = await Dream.findOne({
            where: {
                UserId: authorId,
                number: dreamNumber
            }
        });
        if(dream)
            return dream;
        return null;
    }
    public async getDreamsList(authorId: string, limit?: number): Promise<IDreamInstance[]> {
        let dreams = await Dream.findAll({
            where: { UserId: authorId },
            limit: limit ? limit : null,
            order: [ ['title', 'DESC'] ]
        });
        if(dreams)
            return dreams;
        return [];
    }
    public async deleteDream(authorId: string, dreamNumber: number): Promise<number> {
        return Dream.destroy({
            where: { UserId: authorId, number: dreamNumber }
        })
    }
    public async editDream(authorId: string, dreamNumber: number, dreamTitle: string, dreamContent: string): Promise<IDreamInstance> {
        let dream = await Dream.findOne({
            where: { UserId: authorId, number: dreamNumber }
        });
        if(!dream)
            return null;
        dream.content = dreamContent;
        dream.title = dreamTitle;
        await dream.save();
        return dream;
    }
    private async getLastDreamNumber(userId: string) {
        let number = await Dream.max('number', {
            where: { userId: userId }
        });
        if(number)
            return number;
        else return 0;
    }
}
