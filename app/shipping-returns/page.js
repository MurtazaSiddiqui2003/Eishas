import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from "@/lib/delivery";
import { formatPrice } from "@/lib/currency";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Shipping & Returns",
  description: "Delivery times, charges, and our exchange/return policy.",
};

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter'] flex flex-col">
      <div className="w-full max-w-[640px] mx-auto px-6 py-14 flex-1">
        <a href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-10">
          Eisha&rsquo;s
        </a>

        <h1 className="font-['Cormorant_Garamond'] text-3xl mb-8 text-center">
          Shipping &amp; Returns
        </h1>

        <section className="mb-8">
          <h2 className="font-['Cormorant_Garamond'] text-xl mb-3">Delivery</h2>
          <div className="text-sm leading-relaxed opacity-80 space-y-2">
            <p>We deliver across Pakistan via courier.</p>
            <p>
              Standard delivery charge is {formatPrice(DELIVERY_FEE)}. Orders over{" "}
              {formatPrice(FREE_DELIVERY_THRESHOLD)} qualify for free delivery automatically.
            </p>
            <p>Orders are typically dispatched within 1–2 business days of payment confirmation (or immediately for Cash on Delivery), and arrive within 3–7 business days depending on your city.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-['Cormorant_Garamond'] text-xl mb-3">Payment</h2>
          <div className="text-sm leading-relaxed opacity-80 space-y-2">
            <p>
              We accept EasyPaisa, JazzCash, SadaPay, bank transfer, and Cash on Delivery,
              depending on what&rsquo;s currently available at checkout.
            </p>
            <p>
              For prepaid orders, your order is confirmed once payment is verified. Please
              share your payment screenshot or transaction ID via WhatsApp using the link on
              your order confirmation page.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-['Cormorant_Garamond'] text-xl mb-3">Exchanges &amp; Returns</h2>
          <div className="text-sm leading-relaxed opacity-80 space-y-2">
            <p>
              If you receive a damaged, defective, or incorrect item, contact us within 3 days
              of delivery and we&rsquo;ll arrange an exchange or refund.
            </p>
            <p>
              Unstitched fabric, worn/altered apparel, and sale items are not eligible for
              return unless found to be genuinely defective.
            </p>
            <p>
              For jewelry and beauty products, items must be unused and in original packaging
              to qualify for exchange.
            </p>
          </div>
        </section>

        <p className="text-xs opacity-50 text-center mt-10">
          Questions about an order? Reach out on our{" "}
          <a href="/contact" className="text-[var(--gold-deep)] underline">Contact page</a>.
        </p>
      </div>
      <Footer variant="shell" />
    </main>
  );
}
