import CryptoJS from "crypto-js";

export function verifyTelegramWebAppData(telegramInitData: string) {
    const initData = new URLSearchParams(telegramInitData);
    const hash = initData.get("hash");
    const dataToCheck: string[] = [];

    initData.sort();
    initData.forEach((val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`));

    const secret = CryptoJS.HmacSHA256(process.env.TELEGRAM_BOT_TOKEN!, "WebAppData");
    const _hash = CryptoJS.HmacSHA256(dataToCheck.join("\n"), secret).toString(CryptoJS.enc.Hex);

    return _hash === hash;
}