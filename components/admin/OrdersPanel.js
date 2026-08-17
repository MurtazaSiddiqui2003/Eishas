"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/currency";

const PAYMENT_STATUSES = ["pending_verification", "paid", "failed"];
const FULFILLMENT_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const paymentLabel = {
  pending_verification: "Pending verification",
  paid: "Paid",
  failed: "Failed",
};

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  async function loadOrders() {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateOrder(id, patch) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    loadOrders();
  }

  function handlePrint(order) {
    setPrintOrder(order);
    // Give the invoice a tick to render before opening the print dialog.
    setTimeout(() => window.print(), 50);
  }

  return (
    <>
      <div className="print:hidden p-8 max-w-[900px] mx-auto">
        <h2 className="text-sm mb-4">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </h2>

        {loading ? (
          <p className="text-sm text-[#888]">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-[#888]">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {orders.map((o) => (
              <div key={o._id} className="bg-white border border-[#e2e2de] text-sm">
                <button
                  className="w-full flex flex-wrap items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}
                >
                  <span className="font-medium">{o.orderNumber}</span>
                  <span className="flex-1 text-[#666]">{o.customerName}</span>
                  <span>{formatPrice(o.total)}</span>
                  <span
                    className={`text-xs px-2 py-0.5 border ${
                      o.paymentStatus === "paid"
                        ? "border-[#1f7a3d] text-[#1f7a3d]"
                        : o.paymentStatus === "failed"
                        ? "border-[#b3261e] text-[#b3261e]"
                        : "border-[#c9a24a] text-[#8a6c1f]"
                    }`}
                  >
                    {paymentLabel[o.paymentStatus]}
                  </span>
                  <span className="text-xs px-2 py-0.5 border border-[#ddd] text-[#666] capitalize">
                    {o.status}
                  </span>
                </button>

                {expandedId === o._id && (
                  <div className="px-4 pb-4 border-t border-[#eee] pt-3 flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-[#888] mb-1">Ship to</p>
                      <p>{o.shippingAddress.line1}</p>
                      <p>
                        {o.shippingAddress.city}
                        {o.shippingAddress.province ? `, ${o.shippingAddress.province}` : ""}{" "}
                        {o.shippingAddress.postalCode || ""}
                      </p>
                      <p>{o.shippingAddress.phone}</p>
                      {o.customerEmail && <p>{o.customerEmail}</p>}
                    </div>

                    <div>
                      <p className="text-xs text-[#888] mb-1">Items</p>
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {item.name}
                            {item.size ? ` (${item.size})` : ""} &times; {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="text-xs text-[#888]">
                        Payment
                        <select
                          className="block mt-1 px-2 py-1.5 border border-[#d5d5d0] text-sm"
                          value={o.paymentStatus}
                          onChange={(e) => updateOrder(o._id, { paymentStatus: e.target.value })}
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {paymentLabel[s]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-[#888]">
                        Fulfillment
                        <select
                          className="block mt-1 px-2 py-1.5 border border-[#d5d5d0] text-sm capitalize"
                          value={o.status}
                          onChange={(e) => updateOrder(o._id, { status: e.target.value })}
                        >
                          {FULFILLMENT_STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        onClick={() => handlePrint(o)}
                        className="ml-auto self-end px-4 py-2 bg-[#1a1a1a] text-white text-xs"
                      >
                        Print invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Only visible when printing — everything else on the page has
          print:hidden, so this is the only thing that ends up on paper. */}
      <div className="hidden print:block p-10">
        {printOrder && <Invoice order={printOrder} />}
      </div>
    </>
  );
}

function Invoice({ order }) {
  return (
    <div className="font-['Inter'] text-black">
      <h1 className="font-['Cormorant_Garamond'] text-2xl mb-1">Eisha&rsquo;s</h1>
      <p className="text-sm mb-6">Order {order.orderNumber}</p>

      <div className="mb-6 text-sm">
        <p className="font-medium mb-1">Ship to</p>
        <p>{order.customerName}</p>
        <p>{order.shippingAddress.line1}</p>
        <p>
          {order.shippingAddress.city}
          {order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ""}{" "}
          {order.shippingAddress.postalCode || ""}
        </p>
        <p>{order.shippingAddress.phone}</p>
      </div>

      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-black/20">
              <td className="py-2">
                {item.name}
                {item.size ? ` (${item.size})` : ""}
              </td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-right text-base font-medium">Total: {formatPrice(order.total)}</p>
    </div>
  );
}
