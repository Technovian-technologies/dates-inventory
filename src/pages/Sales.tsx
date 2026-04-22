import { AppShell } from "@/components/layout/AppShell";
import { Star, Ticket } from "lucide-react";
import medjool from "@/assets/medjool.jpg";
import deglet from "@/assets/deglet.jpg";
import ajwa from "@/assets/ajwa.jpg";
import sukkari from "@/assets/sukkari.jpg";

const varieties = [
  {
    img: medjool,
    name: "Medjool King",
    price: "24.00",
    origin: "Grade A+ Morocco",
    status: "In Stock",
    statusClass: "bg-gold/30 text-gold-foreground",
  },
  {
    img: deglet,
    name: "Deglet Noor",
    price: "18.50",
    origin: "Sidi Okba, Algeria",
    selected: true,
  },
  {
    img: ajwa,
    name: "Ajwa Reserve",
    price: "45.00",
    origin: "Madinah Munawwarah",
    status: "Low Stock",
    statusClass: "bg-destructive/15 text-destructive",
  },
];

export default function SalesPage() {
  return (
    <AppShell action="Point of Sale">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">Select Variety</h1>
            <div className="flex gap-2">
              <button className="px-5 h-10 rounded-full bg-gold text-gold-foreground text-xs font-semibold uppercase tracking-[0.18em]">
                Premium Only
              </button>
              <button className="px-5 h-10 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent">
                Organic
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {varieties.map((v) => (
              <article
                key={v.name}
                className={[
                  "rounded-2xl overflow-hidden shadow-card border transition",
                  v.selected
                    ? "bg-gradient-espresso text-cream border-primary"
                    : "bg-card border-transparent hover:shadow-soft",
                ].join(" ")}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={v.img}
                    alt={v.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-xl leading-tight">{v.name}</h3>
                    <p
                      className={[
                        "font-semibold text-lg",
                        v.selected ? "text-gold" : "text-foreground",
                      ].join(" ")}
                    >
                      ${v.price}
                    </p>
                  </div>
                  <p
                    className={[
                      "text-[10px] uppercase tracking-[0.2em] mt-2",
                      v.selected ? "text-gold/80" : "text-olive",
                    ].join(" ")}
                  >
                    {v.origin}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    {v.selected ? (
                      <span className="text-[10px] uppercase tracking-[0.22em] bg-cream/15 px-3 py-1.5 rounded-md font-semibold">
                        Selected
                      </span>
                    ) : (
                      <span
                        className={[
                          "text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-md font-semibold",
                          v.statusClass,
                        ].join(" ")}
                      >
                        {v.status}
                      </span>
                    )}
                    <span
                      className={[
                        "text-[10px] uppercase tracking-[0.18em]",
                        v.selected ? "text-cream/60" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      per kg
                    </span>
                  </div>
                </div>
              </article>
            ))}

            <article className="rounded-2xl bg-card shadow-card overflow-hidden grayscale opacity-80">
              <div className="aspect-square overflow-hidden">
                <img src={sukkari} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl">Barhi Gold (Fresh)</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
                  Coming Next Season
                </p>
              </div>
            </article>

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
        </div>

        <aside className="bg-cream-deep/60 rounded-3xl p-6 lg:p-7 h-fit shadow-card lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between gap-2 mb-5">
            <h2 className="font-serif text-2xl">Order Ledger</h2>
            <p className="text-xs text-muted-foreground">#LD-90210</p>
          </div>

          <div className="flex items-center gap-3 pb-5 border-b border-border">
            <img src={deglet} alt="" loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base">Deglet Noor</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                2.5 kg Selected
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$46.25</p>
              <button className="text-[10px] uppercase tracking-[0.18em] text-destructive font-semibold hover:underline">
                Remove
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">
              Weight Precision (kg)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {["2.5", "5.0", "10.0", "Custom"].map((w, i) => (
                <button
                  key={w}
                  className={[
                    "h-11 rounded-lg text-sm font-semibold transition",
                    i === 0
                      ? "bg-card border-2 border-primary"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">
              Apply Heritage Discount
            </p>
            <div className="relative">
              <input
                placeholder="Promo Code"
                className="w-full h-12 rounded-xl bg-card border border-border px-4 pr-12 text-sm placeholder:italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent">
                <Ticket className="h-4 w-4 text-olive" />
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span className="uppercase text-[11px] tracking-[0.18em]">Subtotal</span>
              <span className="font-medium text-foreground">$46.25</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="uppercase text-[11px] tracking-[0.18em]">Tax (Exempt)</span>
              <span className="font-medium text-foreground">$0.00</span>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <p className="font-serif text-xl">Total Ledger</p>
            <p className="font-serif text-4xl tracking-tight">$46.25</p>
          </div>

          <button className="mt-6 w-full rounded-xl bg-olive text-cream h-14 text-sm font-bold uppercase tracking-[0.22em] hover:opacity-90 transition shadow-soft">
            Finalize Sale
          </button>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center mt-4">
            Transaction Secured via Vault Ledger Protocol
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
