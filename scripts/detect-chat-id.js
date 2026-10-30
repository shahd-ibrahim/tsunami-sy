/**
 * Helper to auto-detect Telegram Admin Group Chat ID from getUpdates
 */
const token = process.env.TELEGRAM_BOT_TOKEN || "8854361071:AAGDwPMejacRzSfI-g3n7WV3Dm2jkmQAtFw";

async function detectChatId() {
  const url = `https://api.telegram.org/bot${token}/getUpdates`;
  console.log("Checking updates from Telegram Bot...");
  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) {
    console.error("Error from Telegram API:", data);
    return;
  }

  if (!data.result || data.result.length === 0) {
    console.log("No messages/updates found yet.");
    console.log("Please make sure to:");
    console.log("1. Add @tsunamisybot to the group.");
    console.log("2. Send any message in the group (e.g. /start or 'hello').");
    return;
  }

  for (const update of data.result) {
    const chat =
      update.message?.chat ||
      update.my_chat_member?.chat ||
      update.channel_post?.chat;
    if (chat) {
      console.log(`Found Chat: Title="${chat.title || 'Private'}", ID="${chat.id}", Type="${chat.type}"`);
    }
  }
}

detectChatId();
