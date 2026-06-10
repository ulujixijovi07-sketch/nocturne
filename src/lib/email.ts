import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_API_KEY
  ? "NOCTURNE <orders@lovenocturne.com>"
  : null;

export async function sendOrderConfirmation(to: string, data: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
  trackingUrl: string;
}) {
  if (!resend || !FROM) return console.log("[EMAIL] Order confirmation would send to", to, data.orderNumber);

  const itemsHtml = data.items.map(i => 
    `<tr><td style="padding:8px 0">${i.name}</td><td style="padding:8px 0;text-align:center">×${i.qty}</td><td style="padding:8px 0;text-align:right">$${i.price.toFixed(2)}</td></tr>`
  ).join("");

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Order Confirmed — ${data.orderNumber}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">Thank you for your order, ${data.customerName}.</p>
          <div style="background:#2D2520;padding:20px;margin:30px 0;text-align:center">
            <p style="font-size:12px;color:#A69D94;text-transform:uppercase;letter-spacing:0.1em">Order Number</p>
            <p style="font-size:24px;color:#C9A96E;margin:8px 0;letter-spacing:0.05em">${data.orderNumber}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;color:#A69D94;font-size:14px">
            ${itemsHtml}
            <tr><td colspan="3"><hr style="border-color:#3D3530;margin:12px 0"></td></tr>
            <tr><td colspan="2" style="text-align:right;padding:4px 0">Total</td><td style="text-align:right;font-size:18px;color:#F6F2ED">$${data.total.toFixed(2)}</td></tr>
          </table>
          <div style="text-align:center;margin:30px 0">
            <a href="${data.trackingUrl}" style="background:#C9A96E;color:#1A1817;padding:14px 40px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block">Track Your Order</a>
          </div>
          <p style="font-size:11px;color:#5A524A;text-align:center;margin-top:40px">Discreet packaging • Private billing • SSL encrypted</p>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send order confirmation:", e);
  }
}

export async function sendShippingNotification(to: string, data: {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingCompany?: string;
}) {
  if (!resend || !FROM) return console.log("[EMAIL] Shipping notification would send to", to, data.orderNumber);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Your Order Has Shipped — ${data.orderNumber}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">Your order is on its way, ${data.customerName}.</p>
          <div style="background:#2D2520;padding:20px;margin:30px 0;text-align:center">
            <p style="font-size:12px;color:#A69D94;text-transform:uppercase;letter-spacing:0.1em">Tracking Number</p>
            <p style="font-size:20px;color:#C9A96E;margin:8px 0">${data.trackingNumber}</p>
            ${data.trackingCompany ? `<p style="font-size:12px;color:#5A524A">via ${data.trackingCompany}</p>` : ""}
          </div>
          <p style="font-size:11px;color:#5A524A;text-align:center;margin-top:40px">Expect delivery in 5–15 business days</p>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send shipping notification:", e);
  }
}

export async function sendPasswordReset(to: string, resetUrl: string) {
  if (!resend || !FROM) return console.log("[EMAIL] Password reset would send to", to);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset Your Password — NOCTURNE",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">You requested a password reset.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${resetUrl}" style="background:#C9A96E;color:#1A1817;padding:14px 40px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block">Reset Password</a>
          </div>
          <p style="font-size:11px;color:#5A524A;text-align:center">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send password reset:", e);
  }
}

export async function sendWelcomeEmail(to: string) {
  if (!resend || !FROM) return console.log("[EMAIL] Welcome email would send to", to);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to the Nocturne Society",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">You've joined the Nocturne Society.</p>
          <div style="background:#2D2520;padding:20px;margin:30px 0;text-align:center">
            <p style="font-size:12px;color:#A69D94;text-transform:uppercase;letter-spacing:0.1em">What you'll receive</p>
            <p style="font-size:14px;color:#F6F2ED;line-height:1.8;margin:12px 0">
              • Private collection previews<br>
              • Members-only early access<br>
              • Curated editorials on desire & design
            </p>
          </div>
          <div style="text-align:center;margin:30px 0">
            <a href="https://lovenocturne.com" style="background:#C9A96E;color:#1A1817;padding:14px 40px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block">Explore the Collection</a>
          </div>
          <p style="font-size:11px;color:#5A524A;text-align:center;margin-top:40px">Discreet packaging • Private billing • SSL encrypted</p>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send welcome email:", e);
  }
}

export async function sendAbandonedCartReminder(
  to: string,
  customerName: string,
  items: { name: string; image: string; price: number; qty: number }[],
  cartUrl: string,
) {
  if (!resend || !FROM) return console.log("[EMAIL] Abandoned cart reminder would send to", to);

  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #3D3530">
            <span style="color:#F6F2ED">${i.name}</span>
            <span style="color:#A69D94;font-size:12px;display:block">×${i.qty}</span>
          </td>
          <td style="padding:12px 0;text-align:right;border-bottom:1px solid #3D3530;color:#C9A96E">$${i.price.toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your cart is waiting — NOCTURNE",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">${customerName}, you left something behind.</p>
          <table style="width:100%;border-collapse:collapse;margin:30px 0">
            ${itemsHtml}
          </table>
          <div style="text-align:center;margin:30px 0">
            <a href="${cartUrl}" style="background:#C9A96E;color:#1A1817;padding:14px 40px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block">Complete Your Order</a>
          </div>
          <p style="font-size:11px;color:#5A524A;text-align:center">Items in your cart are reserved for a limited time.</p>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send abandoned cart reminder:", e);
  }
}

const TIER_NAMES: Record<string, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

const TIER_BENEFITS: Record<string, string> = {
  SILVER: "Free shipping on all orders • Early access to new collections • 5% birthday bonus",
  GOLD: "Free express shipping • Private collection previews • 10% birthday bonus • Priority support",
  PLATINUM: "Complimentary worldwide shipping • VIP collection access • 15% birthday bonus • Personal stylist • Exclusive event invitations",
};

export async function sendTierUpgradeEmail(to: string, customerName: string, newTier: string) {
  if (!resend || !FROM) return console.log("[EMAIL] Tier upgrade would send to", to, newTier);

  const tierName = TIER_NAMES[newTier] || newTier;
  const benefits = TIER_BENEFITS[newTier] || "";

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `You've reached ${tierName} Tier — NOCTURNE`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">${customerName}, your devotion has been recognized.</p>
          <div style="background:#2D2520;padding:24px;margin:30px 0;text-align:center;border:1px solid #C9A96E">
            <p style="font-size:10px;color:#A69D94;text-transform:uppercase;letter-spacing:0.15em">You are now</p>
            <p style="font-size:28px;color:#C9A96E;margin:8px 0;letter-spacing:0.05em">${tierName} Tier</p>
          </div>
          <div style="background:#2D2520;padding:20px;margin:20px 0">
            <p style="font-size:12px;color:#A69D94;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px">Your Benefits</p>
            <p style="font-size:13px;color:#A69D94;line-height:1.8">${benefits.split(" • ").map((b) => `• ${b}<br>`).join("")}</p>
          </div>
          <div style="text-align:center;margin:30px 0">
            <a href="https://lovenocturne.com" style="background:#C9A96E;color:#1A1817;padding:14px 40px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block">Explore New Arrivals</a>
          </div>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send tier upgrade:", e);
  }
}

export async function sendBirthdayGift(to: string, customerName: string, giftCode: string, discountPercent: number) {
  if (!resend || !FROM) return console.log("[EMAIL] Birthday gift would send to", to, giftCode);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "A gift for your birthday — NOCTURNE",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
          <h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
          <p style="text-align:center;font-size:14px;color:#A69D94;margin-top:30px">Happy birthday, ${customerName}.</p>
          <div style="background:#2D2520;padding:24px;margin:30px 0;text-align:center;border:1px solid #C9A96E">
            <p style="font-size:10px;color:#A69D94;text-transform:uppercase;letter-spacing:0.15em">Your Birthday Gift</p>
            <p style="font-size:36px;color:#C9A96E;margin:8px 0">${discountPercent}% Off</p>
            <p style="font-size:13px;color:#A69D94;margin-top:8px">Use code at checkout:</p>
            <p style="font-family:monospace;font-size:20px;color:#F6F2ED;background:#1A1817;padding:8px 20px;display:inline-block;margin-top:4px;letter-spacing:0.1em">${giftCode}</p>
          </div>
          <div style="text-align:center;margin:30px 0">
            <a href="https://lovenocturne.com" style="background:#C9A96E;color:#1A1817;padding:14px 40px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block">Treat Yourself</a>
          </div>
          <p style="font-size:11px;color:#5A524A;text-align:center">Valid for 30 days. One-time use only.</p>
        </div>`,
    });
  } catch (e) {
    console.error("[EMAIL] Failed to send birthday gift:", e);
  }
}
