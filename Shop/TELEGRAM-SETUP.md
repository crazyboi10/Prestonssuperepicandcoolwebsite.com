# Telegram order alerts

1. In Telegram, open `@BotFather`, send `/newbot`, and follow the prompts.
2. Copy the bot token. Keep it private.
3. Open your new bot and send it a message such as `hello`.
4. Open this URL in a browser, replacing `BOT_TOKEN`:

   `https://api.telegram.org/botBOT_TOKEN/getUpdates`

5. Find `message.chat.id` in the response. This is your chat ID.
6. Install the Supabase CLI, log in, and link this project:

   `supabase login`

   `supabase link --project-ref gqcvoqemwsaptfcztani`

7. From the website folder, set the two secrets. Do not put either value in the website files:

   `supabase secrets set TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN TELEGRAM_CHAT_ID=YOUR_CHAT_ID`

8. Deploy the function:

   `supabase functions deploy send-order-telegram --no-verify-jwt`

After deployment, customers can place an order from the shop and the message will arrive in your Telegram chat. The website keeps the email fallback if Telegram is temporarily unavailable.
