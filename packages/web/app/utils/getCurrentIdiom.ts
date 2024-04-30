import { AppConfigModel, IdiomModel } from "shared";
import { sendToAdminTelegram } from "./sendToAdminTelegram";

export async function getCurrentIdiom() {
    const appConfig = await AppConfigModel.findOne();

    if (!appConfig) {
        console.error('getCurrentIdiom: No AppConfig found');
        sendToAdminTelegram('getCurrentIdiom: No AppConfig found');
        return null;
    }

    const idiomId = appConfig.idiomId;

    if (!idiomId) {
        console.error('getCurrentIdiom: No idiomId found in AppConfig');
        sendToAdminTelegram('getCurrentIdiom: No idiomId found in AppConfig');
        return null
    }

    const idiom = IdiomModel.findOne({ _id: idiomId });

    if (!idiom) {
        console.error('getCurrentIdiom: No idiom found with id', idiomId);
        sendToAdminTelegram(`getCurrentIdiom: No idiom found with id ${idiomId}`);
        return null;
    }

    return idiom;
}