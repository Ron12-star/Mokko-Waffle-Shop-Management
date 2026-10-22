// ╔══════════════════════════════════════════════════════════════════════╗
// ║  📱 META WHATSAPP CLOUD API CONFIGURATION (1,000 Free Msgs/Month)   ║
// ║                                                                    ║
// ║  Free Tier Steps:                                                  ║
// ║  1. Go to https://developers.facebook.com                           ║
// ║  2. Create App > Type: Business > Add "WhatsApp" product          ║
// ║  3. Copy your "Phone Number ID" and "Temporary / Permanent Token"   ║
// ║  4. Put them in your backend .env file (explained in documentation) ║
// ╚══════════════════════════════════════════════════════════════════════╝

export const WHATSAPP_CONFIG = {
  // ──────────────────────────────────────────────
  // 🔑 META WHATSAPP CLOUD API CREDENTIALS
  // ──────────────────────────────────────────────
  META_WA_PHONE_NUMBER_ID: process.env.META_WA_PHONE_NUMBER_ID || '',
  META_WA_ACCESS_TOKEN: process.env.META_WA_ACCESS_TOKEN || '',
  META_WA_BUSINESS_ACCOUNT_ID: process.env.META_WA_BUSINESS_ACCOUNT_ID || '',
  META_WA_API_VERSION: process.env.META_WA_API_VERSION || 'v21.0',

  // ──────────────────────────────────────────────
  // 📞 BUSINESS & OWNER NUMBERS
  // ──────────────────────────────────────────────
  BUSINESS_WHATSAPP: process.env.BUSINESS_WHATSAPP || '+91 93284 00954',
  OWNER_WHATSAPP: (process.env.OWNER_WHATSAPP || process.env.ADMIN_PHONE || '9328400954').replace(/\D/g, '').slice(-10),
  ADMIN_WHATSAPP: (process.env.OWNER_WHATSAPP || process.env.ADMIN_PHONE || '9328400954').replace(/\D/g, '').slice(-10),
  SEND_OWNER_COPY: process.env.SEND_OWNER_COPY === 'true' || true,

  // ──────────────────────────────────────────────
  // 🔄 FALLBACK / LEGACY TWILIO (If ever needed)
  // ──────────────────────────────────────────────
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
};

export const WHATSAPP_MESSAGES = [
  {
    id: 'warm_1',
    message: `🧇 *Thank you, {name}!* 🧇\n\nYour order at *{shopName}* is complete! 🎉\n\n💰 *Total: ₹{total}*\n\nHere's your receipt attached below 📄\n\nWe hope every bite brought a smile! 😊\nCome back soon for more delicious moments! ✨\n\n_Good Food • Good Vibes • See You Soon!_ 💛`,
  },
  {
    id: 'warm_2',
    message: `Hey *{name}*! 👋\n\nThanks for choosing *{shopName}*! 🍫🧇\n\nYour bill of *₹{total}* is attached below 📎\n\nWe loved serving you today! Every waffle is made with love & the freshest ingredients 🥰\n\n_See you next time! Keep spreading sweetness!_ 🌟`,
  },
  {
    id: 'warm_3',
    message: `Hi *{name}*! 🎉\n\nYour *{shopName}* experience is complete! ✅\n\n📄 Receipt for *₹{total}* is attached.\n\nThank you for making our day brighter! ☀️\nEvery customer like you makes us love what we do 💕\n\n_Fresh Waffles • Happy Moods • Always!_ 🧇✨`,
  },
];

export function getWhatsAppMessage(customerName: string, total: number, shopName: string): string {
  const template = WHATSAPP_MESSAGES[Math.floor(Math.random() * WHATSAPP_MESSAGES.length)];
  return template.message
    .replace(/\{name\}/g, customerName)
    .replace(/\{total\}/g, total.toLocaleString('en-IN'))
    .replace(/\{shopName\}/g, shopName);
}
