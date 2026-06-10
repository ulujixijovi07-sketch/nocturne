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
