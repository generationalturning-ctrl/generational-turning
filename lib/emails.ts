export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type OrderItem = {
  name: string;
  details: string;
  quantity: number;
  lineTotal: number;
};

type ShippingAddress = {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

export function customerConfirmationEmail(
  customerName: string,
  items: OrderItem[],
  total: number,
  shippingAddress?: ShippingAddress
): string {
  const safeName = escapeHtml(customerName);

  const rows = items.map((i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#fff">
        <strong>${escapeHtml(i.name)}</strong>${i.quantity > 1 ? ` × ${i.quantity}` : ""}<br>
        <span style="color:#ffffff80;font-size:13px">${escapeHtml(i.details)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#c9a84c;text-align:right;white-space:nowrap">
        $${i.lineTotal.toFixed(2)}
      </td>
    </tr>`).join("");

  const addressBlock = shippingAddress ? `
    <div style="margin-top:24px;padding:16px;background:#1a1a1a">
      <p style="margin:0 0 6px;color:#ffffff60;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Shipping To</p>
      <p style="margin:0;color:#fff;font-size:14px;line-height:1.6">
        ${escapeHtml(shippingAddress.address1)}${shippingAddress.address2 ? `<br>${escapeHtml(shippingAddress.address2)}` : ""}<br>
        ${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.province)} ${escapeHtml(shippingAddress.postalCode)}<br>
        ${escapeHtml(shippingAddress.country)}
      </p>
    </div>` : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;font-family:Inter,sans-serif;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#141414;border:1px solid #2a2a2a;overflow:hidden">
    <div style="background:#1a1208;padding:28px 32px;border-bottom:1px solid #2a2a2a">
      <h1 style="margin:0;font-size:22px;color:#c9a84c;font-family:Georgia,serif">Order Confirmed</h1>
      <p style="margin:6px 0 0;color:#ffffff60;font-size:13px">Generational Turning</p>
    </div>
    <div style="padding:28px 32px">
      <p style="color:#fff;font-size:16px;margin:0 0 8px">Thank you, ${safeName}.</p>
      <p style="color:#ffffff70;font-size:14px;margin:0 0 24px;line-height:1.6">
        Your order has been received and I&apos;ll get started on it shortly.
        Custom pens are handcrafted individually — please allow <strong style="color:#c9a84c">1–2 months</strong> for your pen to be made and shipped.
        I&apos;ll send you another email when it&apos;s on its way.
      </p>

      <table style="width:100%;border-collapse:collapse">
        ${rows}
        <tr>
          <td style="padding-top:14px;color:#ffffff80;font-weight:600">Total</td>
          <td style="padding-top:14px;color:#c9a84c;font-size:18px;font-weight:700;text-align:right">$${total.toFixed(2)} CAD</td>
        </tr>
      </table>

      ${addressBlock}

      <p style="margin:28px 0 0;color:#ffffff40;font-size:13px;line-height:1.6">
        Questions? Reply to this email or reach out at
        <a href="mailto:generationalturning@gmail.com" style="color:#c9a84c">generationalturning@gmail.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function shippedEmail(
  customerName: string,
  shippingAddress?: ShippingAddress
): string {
  const safeName = escapeHtml(customerName);

  const addressBlock = shippingAddress ? `
    <div style="margin-top:24px;padding:16px;background:#1a1a1a">
      <p style="margin:0 0 6px;color:#ffffff60;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Shipping To</p>
      <p style="margin:0;color:#fff;font-size:14px;line-height:1.6">
        ${escapeHtml(shippingAddress.address1)}${shippingAddress.address2 ? `<br>${escapeHtml(shippingAddress.address2)}` : ""}<br>
        ${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.province)} ${escapeHtml(shippingAddress.postalCode)}<br>
        ${escapeHtml(shippingAddress.country)}
      </p>
    </div>` : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;font-family:Inter,sans-serif;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#141414;border:1px solid #2a2a2a;overflow:hidden">
    <div style="background:#1a1208;padding:28px 32px;border-bottom:1px solid #2a2a2a">
      <h1 style="margin:0;font-size:22px;color:#c9a84c;font-family:Georgia,serif">Your Pen Is On Its Way</h1>
      <p style="margin:6px 0 0;color:#ffffff60;font-size:13px">Generational Turning</p>
    </div>
    <div style="padding:28px 32px">
      <p style="color:#fff;font-size:16px;margin:0 0 8px">Hi ${safeName},</p>
      <p style="color:#ffffff70;font-size:14px;margin:0 0 24px;line-height:1.6">
        Your pen has been finished and shipped. It should arrive within the next few business days.
        Thank you for your patience — I hope you love it.
      </p>

      ${addressBlock}

      <p style="margin:28px 0 0;color:#ffffff40;font-size:13px;line-height:1.6">
        Any questions? Reply to this email or reach out at
        <a href="mailto:generationalturning@gmail.com" style="color:#c9a84c">generationalturning@gmail.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
