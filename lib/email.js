// Uses the same Nodemailer + Gmail app-password pattern already used on
// CRC Core's contact form, so the setup should feel familiar. Both send
// functions swallow their own errors — a failed email should never stop
// an order from actually being placed.

import nodemailer from "nodemailer";
import { formatPrice } from "./currency";

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function itemsToText(items) {
  return items
    .map((i) => {
      const variant = [i.color, i.size].filter(Boolean).join(", ");
      return `- ${i.name}${variant ? ` (${variant})` : ""} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`;
    })
    .join("\n");
}

export async function sendOrderConfirmationEmail(order) {
  if (!order.customerEmail) return;

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email not sent — EMAIL_USER/EMAIL_PASS not configured.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Eisha's" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Order confirmed — ${order.orderNumber}`,
      text: `Hi ${order.customerName},

Thanks for your order! Here's a summary:

Order: ${order.orderNumber}

${itemsToText(order.items)}

Subtotal: ${formatPrice(order.subtotal)}
Delivery: ${order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}
Total: ${formatPrice(order.total)}

Shipping to:
${order.shippingAddress.line1}
${order.shippingAddress.city}${order.shippingAddress.province ? ", " + order.shippingAddress.province : ""}
${order.shippingAddress.phone}

We'll be in touch about payment and delivery. Thank you for shopping with Eisha's!`,
    });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}

export async function sendAdminNotificationEmail(order, notificationEmail) {
  if (!notificationEmail) return;

  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Eisha's" <${process.env.EMAIL_USER}>`,
      to: notificationEmail,
      subject: `New order — ${order.orderNumber} (${formatPrice(order.total)})`,
      text: `New order placed.

Order: ${order.orderNumber}
Customer: ${order.customerName} (${order.customerEmail || "no email"})
Payment method: ${order.paymentMethod}

${itemsToText(order.items)}

Total: ${formatPrice(order.total)}

Shipping to:
${order.shippingAddress.line1}, ${order.shippingAddress.city}
${order.shippingAddress.phone}

View it in the admin Orders tab.`,
    });
  } catch (err) {
    console.error("Failed to send admin notification email:", err);
  }
}
