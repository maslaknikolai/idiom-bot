import { AppConfig, AppConfigModel, ChatModel, Idiom, IdiomModel } from "shared";
import { logToAdmin } from "./logToAdmin";

export async function updateDailyIdiom(forced = false) {
  try {
    const shouldUpdateIdiom = forced || await checkShouldUpdateIdiom();

    if (!shouldUpdateIdiom) {
      console.log('No need to update idiom', new Date());
      return;
    }

    const idiom = await IdiomModel.findOne({is_used: false} satisfies Partial<Idiom>)

    if (!idiom) {
      return handleError('No unused idiom found');
    }

    idiom.is_used = true;

    await idiom.save();

    const existingAppConfig = await AppConfigModel.findOne()
    if (existingAppConfig) {
      existingAppConfig.idiom_id = idiom._id;
      existingAppConfig.idiom_updated_at = new Date();

      await existingAppConfig.save();
    } else {
      console.log('Creating new AppConfig');
      logToAdmin('Creating new AppConfig');

      await AppConfigModel.create({
        idiom_id: idiom._id,
        idiom_updated_at: new Date()
      } satisfies AppConfig);
    }

    console.log(`Daily idiom updated: ${idiom.text}`);
    logToAdmin(`Daily idiom updated: ${idiom.text}`);

    async function checkShouldUpdateIdiom() {
      const existingAppConfig = await AppConfigModel.findOne()

      const now = new Date();
      const lastUpdated = existingAppConfig?.idiom_updated_at || new Date(0);
      const diff = now.getTime() - lastUpdated.getTime();
      const DAY_IN_MS = 1000 * 60 * 60 * 24;

      return diff > DAY_IN_MS;
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
