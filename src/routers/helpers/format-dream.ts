import { IDreamInstance } from "../../models/dream";

export default function formatDream(dream: IDreamInstance, contentLimit?: number) {
    let dreamContent: string = '';
    if(contentLimit && contentLimit < dream.content.length) {
        dreamContent = dream.content.slice(0, contentLimit);
    }
    else dreamContent = dream.content;
    return {
        id: dream.number,
        content: dreamContent,
        title: dream.title,
        date: dream.date
    };
}
