import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import PaymentSettings from "@/models/PaymentSettings";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const STORES = [
  { key: "apparel", label: "Eisha's Collection" },
  { key: "beauty", label: "Eisha's Beauty" },
  { key: "jewelry", label: "Eisha's Jewelry" },
];

const METHOD_LABELS = {
  bank_transfer: "Bank Transfer",
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  sadapay: "SadaPay",
  cod: "Cash on Delivery",
};

async function getData() {
  await connectDB();
  const [allSettings, paymentSettings] = await Promise.all([
    Settings.find({}).lean(),
    PaymentSettings.findOne({ key: "default" }).lean(),
  ]);

  const settingsByStore = {};
  for (const s of allSettings) settingsByStore[s.store] = s;

  const acceptedMethods = [];
  if (paymentSettings?.bankName && paymentSettings?.accountNumber) acceptedMethods.push("bank_transfer");
  if (paymentSettings?.easypaisaNumber) acceptedMethods.push("easypaisa");
  if (paymentSettings?.jazzcashNumber) acceptedMethods.push("jazzcash");
  if (paymentSettings?.sadapayNumber) acceptedMethods.push("sadapay");
  if (paymentSettings?.codEnabled !== false) acceptedMethods.push("cod");

  return {
    settingsByStore: JSON.parse(JSON.stringify(settingsByStore)),
    whatsappNumber: paymentSettings?.whatsappNumber,
    contactPhone: paymentSettings?.contactPhone,
    acceptedMethods,
  };
}

export default async function ContactPage() {
  const { settingsByStore, whatsappNumber, contactPhone, acceptedMethods } = await getData();

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : null;
  const phoneLink = contactPhone ? `tel:${contactPhone.replace(/\s/g, "")}` : null;

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--ink)] font-['Inter'] flex flex-col">
      <div className="w-full max-w-[600px] mx-auto px-6 py-14 flex-1">
        <a href="/" className="block text-center font-['Cormorant_Garamond'] text-2xl mb-3">
          Eisha&rsquo;s
        </a>
        <h1 className="text-center font-['Cormorant_Garamond'] text-3xl mb-2">Get in touch</h1>
        <p className="text-center text-sm opacity-70 mb-10">
          Questions about an order, a product, or anything else — reach out any of these ways.
        </p>

        <div className="flex flex-col gap-3 mb-10">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3.5 bg-[#25D366] text-white font-medium text-sm"
            >
              Message us on WhatsApp
            </a>
          )}
          {phoneLink && (
            <a
              href={phoneLink}
              className="block text-center py-3.5 border border-black/20 text-[var(--ink)] font-medium text-sm"
            >
              Call {contactPhone}
            </a>
          )}
          {!whatsappLink && !phoneLink && (
            <p className="text-center text-sm opacity-60">
              Contact details haven&rsquo;t been set up yet.
            </p>
          )}
        </div>

        <div className="bg-white border border-black/10 p-6 mb-8">
          <h2 className="font-['Cormorant_Garamond'] text-lg mb-4 text-center">Follow along</h2>
          <div className="flex flex-col gap-2">
            {STORES.map((store) => {
              const url = settingsByStore[store.key]?.instagramUrl;
              return (
                <div key={store.key} className="flex items-center justify-between text-sm py-1.5">
                  <span className="opacity-75">{store.label}</span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold-deep)] underline"
                    >
                      Instagram
                    </a>
                  ) : (
                    <span className="opacity-40 text-xs">Not linked yet</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {acceptedMethods.length > 0 && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide opacity-50 mb-2">We accept</p>
            <div className="flex flex-wrap justify-center gap-2">
              {acceptedMethods.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1.5 border border-black/15 text-xs"
                >
                  {METHOD_LABELS[m]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer variant="shell" whatsappNumber={whatsappNumber} contactPhone={contactPhone} />
    </main>
  );
}
