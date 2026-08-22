"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  easypaisaNumber: "",
  easypaisaName: "",
  jazzcashNumber: "",
  jazzcashName: "",
  sadapayNumber: "",
  sadapayName: "",
  codEnabled: true,
  whatsappNumber: "",
  contactPhone: "",
  notificationEmail: "",
  instructions: "",
};

export default function PaymentPanel() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => setForm({ ...emptyForm, ...data }));
  }, []);

  function update(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Could not save");
      setStatus({ type: "success", message: "Saved." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "px-3 py-2.5 border border-[#d5d5d0] text-sm font-inherit";

  return (
    <div className="p-8 max-w-[560px] mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-6 border border-[#e2e2de]">
        <div className="mb-2">
          <h2 className="text-sm mb-1">Payment &amp; contact details</h2>
          <p className="text-xs text-[#888]">
            A payment method only shows up at checkout once its details are filled
            in here. Leave a section blank to hide that method.
          </p>
        </div>

        <p className="text-xs text-[#666] font-medium mt-1">Bank transfer</p>
        <input className={inputClass} placeholder="Bank name" value={form.bankName} onChange={update("bankName")} />
        <input className={inputClass} placeholder="Account title" value={form.accountTitle} onChange={update("accountTitle")} />
        <input className={inputClass} placeholder="Account number" value={form.accountNumber} onChange={update("accountNumber")} />
        <input className={inputClass} placeholder="IBAN (optional)" value={form.iban} onChange={update("iban")} />

        <p className="text-xs text-[#666] font-medium mt-3">EasyPaisa</p>
        <input className={inputClass} placeholder="EasyPaisa number" value={form.easypaisaNumber} onChange={update("easypaisaNumber")} />
        <input className={inputClass} placeholder="Account name" value={form.easypaisaName} onChange={update("easypaisaName")} />

        <p className="text-xs text-[#666] font-medium mt-3">JazzCash</p>
        <input className={inputClass} placeholder="JazzCash number" value={form.jazzcashNumber} onChange={update("jazzcashNumber")} />
        <input className={inputClass} placeholder="Account name" value={form.jazzcashName} onChange={update("jazzcashName")} />

        <p className="text-xs text-[#666] font-medium mt-3">SadaPay</p>
        <input className={inputClass} placeholder="SadaPay number" value={form.sadapayNumber} onChange={update("sadapayNumber")} />
        <input className={inputClass} placeholder="Account name" value={form.sadapayName} onChange={update("sadapayName")} />

        <label className="flex items-center gap-1.5 flex-row text-sm mt-3">
          <input type="checkbox" checked={form.codEnabled} onChange={update("codEnabled")} className="w-auto" />
          Allow Cash on Delivery
        </label>

        <p className="text-xs text-[#666] font-medium mt-4">Contact</p>
        <input
          className={inputClass}
          placeholder="WhatsApp number (e.g. 923001234567, no + or spaces)"
          value={form.whatsappNumber}
          onChange={update("whatsappNumber")}
        />
        <p className="text-xs text-[#888] -mt-1">
          Used for the payment-proof button after checkout, and the footer/contact page link.
        </p>
        <input
          className={inputClass}
          placeholder="Contact phone number (optional, shown as a call link)"
          value={form.contactPhone}
          onChange={update("contactPhone")}
        />

        <input
          className={inputClass}
          placeholder="Notification email (you get emailed here when a new order comes in)"
          value={form.notificationEmail}
          onChange={update("notificationEmail")}
        />
        <p className="text-xs text-[#888] -mt-1">
          Requires EMAIL_USER/EMAIL_PASS to be set in your environment variables — see README.
        </p>

        <textarea
          className={`${inputClass} min-h-[70px] resize-y mt-2`}
          placeholder="Any extra instructions (optional) — e.g. delivery time, how long payment verification takes"
          value={form.instructions}
          onChange={update("instructions")}
        />

        {status && (
          <p className={`text-sm ${status.type === "success" ? "text-[#1f7a3d]" : "text-[#b3261e]"}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 mt-2 bg-[#1a1a1a] text-white text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
