import { AppConfig, AppConfigModel, ChatModel, IdiomModel } from "shared";
import { logToAdmin } from "./logToAdmin";

export async function updateDailyIdiom() {
  try {
    const shouldUpdateIdiom = await checkShouldUpdateIdiom();

    if (!shouldUpdateIdiom) {
      console.log('No need to update idiom', new Date());
      return;
    }

    const idiom = await IdiomModel.findOne({is_used: false})

    if (!idiom) {
      return handleError('No idiom found');
    }

    idiom.is_used = true;

    await idiom.save();

    const existingAppConfig = await AppConfigModel.findOne()
    if (existingAppConfig) {
      existingAppConfig.idiomId = idiom._id;
      existingAppConfig.dateActivated = new Date();

      await existingAppConfig.save();
    } else {
      console.log('Creating new AppConfig');
      logToAdmin('Creating new AppConfig');

      await AppConfigModel.create({
        idiomId: idiom._id,
        dateActivated: new Date()
      } satisfies AppConfig);
    }

    console.log(`Daily idiom updated: ${idiom.text}`);
    logToAdmin(`Daily idiom updated: ${idiom.text}`);

    async function checkShouldUpdateIdiom() {
      const existingAppConfig = await AppConfigModel.findOne()

      const now = new Date();
      const lastUpdated = existingAppConfig?.dateActivated || new Date(0);
      const diff = now.getTime() - lastUpdated.getTime();
      const DAY_IN_MS = 1000 * 60 * 60 * 24;
      const diffInDays = diff / (DAY_IN_MS);

      return diffInDays >= 1;
    }
  } catch (error) {
    return handleError('Unhandled error: `updateDailyIdiom`');
  }

  function handleError(error: string) {
    console.error(`updateDailyIdiom: ${error}`);
    logToAdmin(`updateDailyIdiom: ${error}`);
    return null;
  }
}
