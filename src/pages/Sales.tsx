import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Star, Ticket, Loader2, Package, Plus, Minus, Download, X } from "lucide-react";
import { salesAPI, CreateSalePayload } from "@/lib/salesAPI";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ActiveBatch {
  id: string;
  batchId: string;
  varietyId: string;
  varietyName: string;
  grade: string;
  origin: string;
  quantity: number;
  unit: string;
  status: string;
  imageUrl: string | null;
  pricePerKg: number;
}

interface CartItem {
  batch: ActiveBatch;
  quantity: number;
}

interface ClientInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface SaleResponse {
  id: string;
  saleId: string;
  saleDate: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  client: { name: string; phone?: string; address?: string; email?: string } | null;
  items: Array<{
    varietyName?: string;
    batchCode?: string;
    quantity: number;
    unit: string;
    pricePerKg: number;
    subtotal: number;
  }>;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "transfer", label: "Transfer" },
];

export default function SalesPage() {
  const [batches, setBatches] = useState<ActiveBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [client, setClient] = useState<ClientInfo>({ name: "", phone: "", address: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSale, setLastSale] = useState<SaleResponse | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await salesAPI.getActiveBatches();
      setBatches(res.batches || []);
    } catch {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (batch: ActiveBatch) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.batch.id === batch.id);
      if (existing) {
        return prev.map((c) =>
          c.batch.id === batch.id
            ? { ...c, quantity: Math.min(c.quantity + 1, batch.quantity) }
            : c,
        );
      }
      return [...prev, { batch, quantity: 1 }];
    });
  };

  const updateQty = (batchId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.batch.id !== batchId));
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.batch.id === batchId ? { ...c, quantity: Math.min(qty, c.batch.quantity) } : c,
        ),
      );
    }
  };

  const removeFromCart = (batchId: string) => {
    setCart((prev) => prev.filter((c) => c.batch.id !== batchId));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.quantity * c.batch.pricePerKg, 0);
  const total = Math.max(0, subtotal - discount);

  const handleFinalize = async () => {
    if (!client.name.trim()) return toast.error("Client name is required");
    if (cart.length === 0) return toast.error("Add at least one item");

    setSubmitting(true);
    try {
      const payload: CreateSalePayload = {
        client,
        items: cart.map((c) => ({
          varietyId: c.batch.varietyId,
          batchId: c.batch.id,
          quantity: c.quantity,
          unit: c.batch.unit,
          pricePerKg: c.batch.pricePerKg,
        })),
        paymentMethod,
        discount,
        promoCode: promoCode || undefined,
      };

      const res = await salesAPI.create(payload);
      setLastSale(res.sale as SaleResponse);
      toast.success("Sale completed!");
      setCart([]);
      setClient({ name: "", phone: "", address: "", email: "" });
      setDiscount(0);
      setPromoCode("");
      fetchBatches();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to complete sale");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInvoice = (sale: SaleResponse) => {
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const W = 210;
    let y = 20;

    // Header
    doc.setFillColor(30, 20, 10);
    doc.rect(0, 0, W, 40, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HERITAGE CURATOR", 20, 18);
    doc.setFontSize(9);
    doc.setTextColor(200, 190, 170);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Dates Inventory", 20, 26);
    doc.text("TAX INVOICE", W - 20, 18, { align: "right" });
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(11);
    doc.text(`#${sale.saleId || "—"}`, W - 20, 26, { align: "right" });

    y = 52;
    doc.setTextColor(30, 20, 10);

    // Client + Sale info side by side
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 100, 80);
    doc.text("BILL TO", 20, y);
    doc.text("SALE DETAILS", W / 2 + 10, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 20, 10);
    doc.setFontSize(10);

    const cl = sale.client || { name: "", phone: "", address: "", email: "" };
    doc.setFont("helvetica", "bold");
    doc.text(cl.name || "—", 20, y);
    doc.setFont("helvetica", "normal");
    if (cl.phone) {
      y += 5;
      doc.text(`Phone: ${cl.phone}`, 20, y);
    }
    if (cl.address) {
      y += 5;
      doc.text(`Address: ${cl.address}`, 20, y);
    }
    if (cl.email) {
      y += 5;
      doc.text(`Email: ${cl.email}`, 20, y);
    }

    // Right column
    let ry = 58;
    doc.setFontSize(9);
    const saleDate = sale.saleDate
      ? new Date(sale.saleDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";
    doc.text(`Date: ${saleDate}`, W / 2 + 10, ry);
    ry += 5;
    doc.text(`Payment: ${(sale.paymentMethod || "").toUpperCase()}`, W / 2 + 10, ry);
    ry += 5;
    doc.text(`Status: PAID`, W / 2 + 10, ry);

    y = Math.max(y, ry) + 12;

    // Table header
    doc.setFillColor(30, 20, 10);
    doc.rect(15, y - 5, W - 30, 10, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ITEM", 20, y);
    doc.text("QTY", 110, y, { align: "right" });
    doc.text("UNIT PRICE", 145, y, { align: "right" });
    doc.text("SUBTOTAL", W - 20, y, { align: "right" });

    y += 8;
    doc.setTextColor(30, 20, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const items = sale.items || [];
    items.forEach((item, i: number) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 244, 238);
        doc.rect(15, y - 4, W - 30, 9, "F");
      }
      const name = item.varietyName || item.batchCode || `Item ${i + 1}`;
      const qty = parseFloat(String(item.quantity));
      const price = parseFloat(String(item.pricePerKg));
      const sub = parseFloat(String(item.subtotal));
      doc.text(name, 20, y);
      doc.text(`${qty} ${item.unit || "kg"}`, 110, y, { align: "right" });
      doc.text(`SAR ${price.toFixed(2)}`, 145, y, { align: "right" });
      doc.text(`SAR ${sub.toFixed(2)}`, W - 20, y, { align: "right" });
      y += 9;
    });

    y += 4;
    // Totals
    doc.setDrawColor(200, 185, 160);
    doc.line(15, y, W - 15, y);
    y += 6;

    const rows = [
      ["Subtotal", `SAR ${parseFloat(String(sale.subtotal || 0)).toFixed(2)}`],
      ["Discount", `- SAR ${parseFloat(String(sale.discount || 0)).toFixed(2)}`],
      ["Tax", `SAR ${parseFloat(String(sale.tax || 0)).toFixed(2)}`],
    ];
    doc.setFontSize(9);
    rows.forEach(([label, val]) => {
      doc.setTextColor(100, 85, 70);
      doc.text(label, W - 70, y);
      doc.setTextColor(30, 20, 10);
      doc.text(val, W - 20, y, { align: "right" });
      y += 6;
    });

    y += 2;
    doc.setFillColor(30, 20, 10);
    doc.rect(W - 80, y - 5, 65, 12, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", W - 75, y + 2);
    doc.text(`SAR ${parseFloat(String(sale.total || 0)).toFixed(2)}`, W - 20, y + 2, {
      align: "right",
    });

    y += 20;
    doc.setTextColor(150, 130, 110);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business. Heritage Curator — Premium Dates.", W / 2, y, {
      align: "center",
    });

    doc.save(`invoice-${sale.saleId || "sale"}.pdf`);
  };

  return (
    <AppShell action="Point of Sale">
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Left: Batch Selection */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">Select Variety</h1>
            {lastSale && (
              <button
                onClick={() => downloadInvoice(lastSale)}
                className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-gold text-primary text-xs font-semibold uppercase tracking-[0.18em]"
              >
                <Download className="h-4 w-4" /> Download Last Invoice
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card rounded-2xl text-muted-foreground">
              <Package className="h-12 w-12 opacity-30" />
              <p className="text-sm uppercase tracking-widest">No active batches available</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {batches.map((b) => {
                const inCart = cart.find((c) => c.batch.id === b.id);
                return (
                  <article
                    key={b.id}
                    onClick={() => addToCart(b)}
                    className={[
                      "rounded-2xl overflow-hidden shadow-card border transition cursor-pointer",
                      inCart
                        ? "bg-gradient-espresso text-cream border-primary"
                        : "bg-card border-transparent hover:shadow-soft",
                    ].join(" ")}
                  >
                    <div className="aspect-square overflow-hidden bg-cream-deep/40">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.varietyName}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-xl leading-tight">{b.varietyName}</h3>
                        <p
                          className={["font-semibold text-lg", inCart ? "text-gold" : ""].join(" ")}
                        >
                          {b.pricePerKg.toFixed(2)}
                        </p>
                      </div>
                      <p
                        className={[
                          "text-[10px] uppercase tracking-[0.2em] mt-2",
                          inCart ? "text-gold/80" : "text-olive",
                        ].join(" ")}
                      >
                        {b.origin} · Grade {b.grade}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={[
                            "text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-md font-semibold",
                            inCart
                              ? "bg-cream/15 text-cream"
                              : b.status === "low_stock"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-gold/30 text-gold-foreground",
                          ].join(" ")}
                        >
                          {inCart
                            ? `×${inCart.quantity} selected`
                            : b.status === "low_stock"
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                        <span
                          className={[
                            "text-[10px] uppercase tracking-[0.18em]",
                            inCart ? "text-cream/60" : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {b.quantity} {b.unit} avail.
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}

              <article className="sm:col-span-2 rounded-2xl bg-gold/30 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="h-12 w-12 rounded-full bg-olive flex items-center justify-center mb-3">
                  <Star className="h-5 w-5 text-cream fill-cream" />
                </div>
                <h3 className="font-serif text-2xl mb-2">Heritage Bulk Program</h3>
                <p className="text-sm text-foreground/70 max-w-sm">
                  Specialized pricing for orders exceeding 50kg. Consult the curator for exclusive
                  batch availability.
                </p>
                <button className="mt-5 inline-flex items-center rounded-xl bg-primary text-primary-foreground px-6 h-11 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-primary/90">
                  Request Quote
                </button>
              </article>
            </div>
          )}
        </div>

        {/* Right: Order Ledger */}
        <aside className="bg-cream-deep/60 rounded-3xl p-6 lg:p-7 h-fit shadow-card lg:sticky lg:top-28 space-y-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-2xl">Order Ledger</h2>
            <p className="text-xs text-muted-foreground">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Client Info */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Client Information
            </p>
            <input
              placeholder="Client Name *"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              className="w-full h-10 rounded-xl bg-card border border-border px-4 text-sm placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <input
              placeholder="Phone / Contact"
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              className="w-full h-10 rounded-xl bg-card border border-border px-4 text-sm placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <input
              placeholder="Address"
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              className="w-full h-10 rounded-xl bg-card border border-border px-4 text-sm placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <input
              placeholder="Email (optional)"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              className="w-full h-10 rounded-xl bg-card border border-border px-4 text-sm placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-3 border-t border-border pt-4">
              {cart.map((c) => (
                <div
                  key={c.batch.id}
                  className="flex items-center gap-3 pb-3 border-b border-border/40 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm truncate">{c.batch.varietyName}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      SAR {c.batch.pricePerKg}/kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(c.batch.id, c.quantity - 1)}
                      className="h-7 w-7 rounded-lg bg-card flex items-center justify-center hover:bg-accent"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={c.quantity}
                      onChange={(e) => updateQty(c.batch.id, parseFloat(e.target.value) || 0)}
                      className="w-14 h-7 text-center text-sm bg-card rounded-lg border border-border focus:outline-none"
                      step="0.5"
                      min="0.5"
                    />
                    <button
                      onClick={() => updateQty(c.batch.id, c.quantity + 1)}
                      className="h-7 w-7 rounded-lg bg-card flex items-center justify-center hover:bg-accent"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-semibold text-sm">
                      SAR {(c.quantity * c.batch.pricePerKg).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(c.batch.id)}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Method */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPaymentMethod(m.value as "cash" | "card" | "transfer")}
                  className={[
                    "h-10 rounded-lg text-sm font-semibold transition",
                    paymentMethod === m.value
                      ? "bg-card border-2 border-primary"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
              Promo Code
            </p>
            <div className="relative">
              <input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full h-11 rounded-xl bg-card border border-border px-4 pr-12 text-sm placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent">
                <Ticket className="h-4 w-4 text-olive" />
              </button>
            </div>
          </div>

          {/* Discount */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
              Discount (SAR)
            </p>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full h-11 rounded-xl bg-card border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span className="uppercase text-[11px] tracking-[0.18em]">Subtotal</span>
              <span className="font-medium text-foreground">SAR {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span className="uppercase text-[11px] tracking-[0.18em]">Discount</span>
                <span className="font-medium text-destructive">- SAR {discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <p className="font-serif text-xl">Total</p>
            <p className="font-serif text-4xl tracking-tight">SAR {total.toFixed(2)}</p>
          </div>

          <button
            onClick={handleFinalize}
            disabled={submitting || cart.length === 0}
            className="w-full rounded-xl bg-olive text-cream h-14 text-sm font-bold uppercase tracking-[0.22em] hover:opacity-90 transition shadow-soft disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Finalize Sale"}
          </button>

          {lastSale && (
            <button
              onClick={() => downloadInvoice(lastSale)}
              className="w-full rounded-xl border border-gold text-gold h-11 text-sm font-bold uppercase tracking-[0.18em] hover:bg-gold/10 transition flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Download Invoice
            </button>
          )}

          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center">
            Transaction Secured via Vault Ledger Protocol
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
