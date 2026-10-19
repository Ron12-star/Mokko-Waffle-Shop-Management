// ╔══════════════════════════════════════════════════════════════════════╗
// ║  🔧 WHATSAPP CONFIGURATION — UPDATE YOUR CREDENTIALS HERE         ║
// ║                                                                    ║
// ║  Steps to get Twilio WhatsApp:                                     ║
// ║  1. Sign up at https://www.twilio.com                              ║
// ║  2. Go to Console > Messaging > WhatsApp Sandbox                   ║
// ║  3. Copy your Account SID, Auth Token & WhatsApp number            ║
// ║  4. Paste them below — that's it!                                  ║
// ║                                                                    ║
// ║  For production: Apply for a Twilio WhatsApp Business Profile      ║
// ╚══════════════════════════════════════════════════════════════════════╝

export const WHATSAPP_CONFIG = {
  // ──────────────────────────────────────────────
  // 🔑 TWILIO CREDENTIALS (Get from https://console.twilio.com)
  // ──────────────────────────────────────────────
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID_HERE',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN_HERE',

  // ──────────────────────────────────────────────
  // 📱 YOUR TWILIO WHATSAPP SENDER NUMBER
  // For sandbox: whatsapp:+14155238886
  // For production: whatsapp:+91XXXXXXXXXX (your approved number)
  // ──────────────────────────────────────────────
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',

  // ──────────────────────────────────────────────
  // 📞 YOUR BUSINESS WHATSAPP NUMBER (for display on receipts)
  // ──────────────────────────────────────────────
  BUSINESS_WHATSAPP: process.env.BUSINESS_WHATSAPP || '+91 98765 43210',
};

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  💬 HEARTWARMING MESSAGES — Customize your WhatsApp messages!      ║
// ║  These are sent along with the PDF receipt.                         ║
// ║  Add/remove/edit messages freely. One is picked randomly.           ║
// ╚══════════════════════════════════════════════════════════════════════╝

export const WHATSAPP_MESSAGES = [
  // ──── Each message is a template. Use {name}, {total}, {shopName} ────
  {
    id: 'warm_1',
    message: `🧇 *Thank you, {name}!* 🧇

Your order at *{shopName}* is complete! 🎉

💰 *Total: ₹{total}*

Here's your receipt attached below 📄

We hope every bite brought a smile! 😊
Come back soon for more delicious moments! ✨

_Good Food • Good Vibes • See You Soon!_ 💛`,
  },

  {
    id: 'warm_2',
    message: `Hey *{name}*! 👋

Thanks for choosing *{shopName}*! 🍫🧇

Your bill of *₹{total}* is attached below 📎

We loved serving you today! Every waffle is made with love & the freshest ingredients 🥰

_See you next time! Keep spreading sweetness!_ 🌟`,
  },

  {
    id: 'warm_3',
    message: `Hi *{name}*! 🎉

Your *{shopName}* experience is complete! ✅

📄 Receipt for *₹{total}* is attached.

Thank you for making our day brighter! ☀️
Every customer like you makes us love what we do 💕

_Fresh Waffles • Happy Moods • Always!_ 🧇✨`,
  },

  {
    id: 'warm_4',
    message: `*{name}*, thank you SO much! 🙏❤️

Your order of *₹{total}* at *{shopName}* is done!

📋 Bill attached below for your records.

You're not just a customer, you're family! 🤗
We can't wait to see you again! 🧇🍓

_Made with love, served with a smile!_ 😊`,
  },
];

// ──────────────────────────────────────────────
// 🎲 Helper: Get a random heartwarming message
// ──────────────────────────────────────────────
export function getWhatsAppMessage(customerName: string, total: number, shopName: string): string {
  const template = WHATSAPP_MESSAGES[Math.floor(Math.random() * WHATSAPP_MESSAGES.length)];
  return template.message
    .replace(/\{name\}/g, customerName)
    .replace(/\{total\}/g, total.toLocaleString('en-IN'))
    .replace(/\{shopName\}/g, shopName);
}
