import invariant from "tiny-invariant";

export async function sendToAdminTelegram(message: string) {
     try {
        invariant(process.env.BOT_WEBHOOK_PORT, 'TELEGRAM_BOT_TOKEN is required');
        await fetch(`http://localhost:${process.env.BOT_WEBHOOK_PORT}/webhook/notify-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }) ,
        } as any)
     } catch (e) {
        console.error('error: sendToAdminTelegram error', e, process.env.BOT_WEBHOOK_PORT);
     }
}