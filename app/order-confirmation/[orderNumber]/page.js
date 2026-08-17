import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

async function getData(orderNumber) {
  await connectDB();
  const [order, settings] = await Promise.all([
    Order.findOne({ orderNumber }).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);
  return {
    order: order ? JSON.parse(JSON.stringify(order)) : null,
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
  };
}

export default async function OrderConfirmationPage({ params }) {
  const { order, settings } = await getData(params.orderNumber);

  if (!order) notFound();

  const whatsappText = encodeURIComponent(
    `Hi! I just placed order ${order.orderNumber} on Eisha's and I'm sending payment proof.`
  );
  const whatsappLink = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${whatsappText}`
    : null;

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter']">
      <div className="max-w-[560px] mx-auto px-6 py-14">
        <a href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-8">
          Eisha&rsquo;s
        </a>

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--gold-deep)] mb-2">
            Order placed
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl mb-2">{order.orderNumber}</h1>
          <p className="text-sm opacity-70">
            Thank you, {order.customerName}. Save this order number — you&rsquo;ll need it when
            sending payment.
          </p>
        </div>

        <div className="bg-white border border-black/10 p-6 mb-6">
          <h2 className="font-['Cormorant_Garamond'] text-lg mb-4">Payment instructions</h2>

          {!settings?.bankName && !settings?.easypaisaNumber ? (
            <p className="text-sm opacity-60">
              Payment details haven&rsquo;t been set up yet — please contact us directly to
              complete payment for this order.
            </p>
          ) : (
            <div className="text-sm space-y-3">
              {settings?.bankName && (
                <div>
                  <p className="font-medium mb-1">Bank Transfer</p>
                  <p className="opacity-75">{settings.bankName}</p>
                  {settings.accountTitle && <p className="opacity-75">Account Title: {settings.accountTitle}</p>}
                  {settings.accountNumber && <p className="opacity-75">Account #: {settings.accountNumber}</p>}
                  {settings.iban && <p className="opacity-75">IBAN: {settings.iban}</p>}
                </div>
              )}
              {settings?.easypaisaNumber && (
                <div>
                  <p className="font-medium mb-1">EasyPaisa</p>
                  <p className="opacity-75">{settings.easypaisaNumber}</p>
                  {settings.easypaisaName && <p className="opacity-75">Account Name: {settings.easypaisaName}</p>}
                </div>
              )}
              {settings?.instructions && (
                <p className="opacity-75 pt-2 border-t border-black/10 whitespace-pre-line">
                  {settings.instructions}
                </p>
              )}
            </div>
          )}

          <p className="text-sm font-medium mt-4 pt-4 border-t border-black/10">
            Amount to pay: {formatPrice(order.total)}
          </p>
        </div>

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-3.5 bg-[#25D366] text-white font-medium text-sm mb-6"
          >
            Send payment proof on WhatsApp
          </a>
        )}

        <div className="bg-white/60 border border-black/10 p-6">
          <h2 className="font-['Cormorant_Garamond'] text-lg mb-3">Order summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="flex-1">
                  {item.name}
                  {item.size ? ` (${item.size})` : ""} &times; {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-medium text-base pt-3 mt-3 border-t border-black/10">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
