import { AppConfigModel, IdiomModel } from "shared";
import { sendToAdminTelegram } from "./sendToAdminTelegram";

export async function getCurrentIdiom() {
    const appConfig = await AppConfigModel.findOne();

    if (!appConfig) {
        console.error('getCurrentIdiom: No AppConfig found');
        sendToAdminTelegram('getCurrentIdiom: No AppConfig found');
        return null;
    }

    if (!appConfig.idiom_id) {
        console.error('getCurrentIdiom: No idiomId found in AppConfig');
        sendToAdminTelegram('getCurrentIdiom: No idiomId found in AppConfig');
        return null
    }

    const idiom = IdiomModel.findOne({ _id: appConfig.idiom_id });

    if (!idiom) {
        console.error('getCurrentIdiom: No idiom found with id', appConfig.idiom_id);
        sendToAdminTelegram(`getCurrentIdiom: No idiom found with id ${appConfig.idiom_id}`);
        return null;
    }

    return idiom;
}