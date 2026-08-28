import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async request => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

    try {
        const { customerName, customerEmail, notes, items, total } = await request.json();
        if (!customerName || !customerEmail || !Array.isArray(items) || !items.length) {
            return new Response(JSON.stringify({ error: 'Missing order details' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
        const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
        if (!botToken || !chatId) return new Response(JSON.stringify({ error: 'Telegram is not configured yet' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const itemText = items.map(item => `${item.quantity} x ${item.name} - $${Number(item.price * item.quantity).toFixed(2)}`).join('\n');
        const text = `NEW PRESTON'S 3D PRINTS ORDER\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\n\n${itemText}\n\nTotal: $${Number(total).toFixed(2)}\nNotes: ${notes || 'None'}`;
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text }) });
        if (!telegramResponse.ok) return new Response(JSON.stringify({ error: 'Telegram could not receive the order alert' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ sent: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (_error) {
        return new Response(JSON.stringify({ error: 'Invalid order request' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
