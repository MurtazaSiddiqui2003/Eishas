import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import PaymentSettings from "@/models/PaymentSettings";
import { formatPrice } from "@/lib/currency";
import Footer from "@/components/Footer";

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

function PaymentInstructions({ method, settings }) {
  if (method === "bank_transfer") {
    return (
      <div className="text-sm space-y-1">
        <p className="font-medium mb-1">Bank Transfer</p>
        <p className="opacity-75">{settings.bankName}</p>
        {settings.accountTitle && <p className="opacity-75">Account Title: {settings.accountTitle}</p>}
        {settings.accountNumber && <p className="opacity-75">Account #: {settings.accountNumber}</p>}
        {settings.iban && <p className="opacity-75">IBAN: {settings.iban}</p>}
      </div>
    );
  }
  if (method === "easypaisa") {
    return (
      <div className="text-sm space-y-1">
        <p className="font-medium mb-1">EasyPaisa</p>
        <p className="opacity-75">{settings.easypaisaNumber}</p>
        {settings.easypaisaName && <p className="opacity-75">Account Name: {settings.easypaisaName}</p>}
      </div>
    );
  }
  if (method === "jazzcash") {
    return (
      <div className="text-sm space-y-1">
        <p className="font-medium mb-1">JazzCash</p>
        <p className="opacity-75">{settings.jazzcashNumber}</p>
        {settings.jazzcashName && <p className="opacity-75">Account Name: {settings.jazzcashName}</p>}
      </div>
    );
  }
  if (method === "sadapay") {
    return (
      <div className="text-sm space-y-1">
        <p className="font-medium mb-1">SadaPay</p>
        <p className="opacity-75">{settings.sadapayNumber}</p>
        {settings.sadapayName && <p className="opacity-75">Account Name: {settings.sadapayName}</p>}
      </div>
    );
  }
  if (method === "cod") {
    return (
      <p className="text-sm opacity-75">
        Pay in cash when your order arrives. No payment needed right now.
      </p>
    );
  }
  return null;
}

export default async function OrderConfirmationPage({ params }) {
  const { order, settings } = await getData(params.orderNumber);

  if (!order) notFound();

  const isCod = order.paymentMethod === "cod";

  const whatsappText = encodeURIComponent(
    `Hi! I just placed order ${order.orderNumber} on Eisha's${isCod ? "" : " and I'm sending payment proof"}.`
  );
  const whatsappLink = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${whatsappText}`
    : null;

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter'] flex flex-col">
      <div className="w-full max-w-[560px] mx-auto px-6 py-14 flex-1">
        <a href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-8">
          Eisha&rsquo;s
        </a>

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--gold-deep)] mb-2">
            Order placed
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl mb-2">{order.orderNumber}</h1>
          <p className="text-sm opacity-70">
            Thank you, {order.customerName}.{" "}
            {isCod
              ? "Your order is being prepared."
              : "Save this order number — you'll need it when sending payment."}
          </p>
        </div>

        <div className="bg-white border border-black/10 p-6 mb-6">
          <h2 className="font-['Cormorant_Garamond'] text-lg mb-4">
            {isCod ? "Payment" : "Payment instructions"}
          </h2>

          <PaymentInstructions method={order.paymentMethod} settings={settings || {}} />

          {settings?.instructions && (
            <p className="text-sm opacity-75 pt-3 mt-3 border-t border-black/10 whitespace-pre-line">
              {settings.instructions}
            </p>
          )}

          <p className="text-sm font-medium mt-4 pt-4 border-t border-black/10">
            {isCod ? "Amount due on delivery" : "Amount to pay"}: {formatPrice(order.total)}
          </p>
        </div>

        {whatsappLink && !isCod && (
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
                  {[item.color, item.size].filter(Boolean).length > 0
                    ? ` (${[item.color, item.size].filter(Boolean).join(", ")})`
                    : ""}{" "}
                  &times; {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm opacity-70 pt-3 mt-3 border-t border-black/10">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm opacity-70">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-medium text-base pt-3 mt-3 border-t border-black/10">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
      <Footer
        variant="shell"
        whatsappNumber={settings?.whatsappNumber}
        contactPhone={settings?.contactPhone}
      />
    </main>
  );
}
