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

8. From the `Shop` folder, deploy the function:

   `supabase functions deploy send-order-telegram --project-ref gqcvoqemwsaptfcztani --no-verify-jwt`

The function source is in `supabase/functions/send-order-telegram/index.ts`, which is the folder layout required by the Supabase CLI. Redeploy it after changing the Telegram message fields.

If the website reports `Failed to send a request to the Edge Function`, verify that this URL no longer returns `404 NotFound`:

`https://gqcvoqemwsaptfcztani.supabase.co/functions/v1/send-order-telegram`

The function must be deployed to the same project shown in that URL. Deploying it to another Supabase project, or deploying only the old `telegram-function/index.ts` folder, will leave the website unable to reach it.

After deployment, customers can place an order from the shop and the message will arrive in your Telegram chat. The website keeps the email fallback if Telegram is temporarily unavailable.

## Order details contract

The shop now sends `create-checkout` these additional fields:

- `orderNumber`
- `customerName`
- `customerEmail`
- `address`
- `notes`

Update the deployed `create-checkout` function so it preserves those values in the Stripe Checkout Session metadata and passes them to `send-order-telegram` after Stripe confirms payment. The Telegram function requires `orderNumber`, `customerName`, `customerEmail`, `address`, `items`, and `total`.

The owner-only inventory panel also includes a fake-order form. It calls `send-order-telegram` directly with `isTestOrder: true`, so it sends a clearly labeled Telegram message without creating a Stripe payment.

## Show the order number after payment

Configure the deployed `create-checkout` function's Stripe Checkout Session with this success URL:

`https://YOUR-SITE-DOMAIN/Shop/success.html?session_id={CHECKOUT_SESSION_ID}`

The shop stores the generated order number before sending the customer to Stripe. The success page reads it and displays it only after Stripe returns the customer to the site. Remove the stored value on cancellation if your checkout function also has a cancel URL.

If the deployed checkout function currently returns to `/Shop/?checkout=success`, upload the latest `script-supabase.js` as well. It handles that live return URL, sends the completed order to Telegram, and then shows the order number.
