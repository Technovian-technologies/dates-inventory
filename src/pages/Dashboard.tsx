import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import {
  ShoppingCart,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Truck,
  Loader2,
  Package,
} from "lucide-react";
import { dashboardAPI } from "@/lib/dashboardAPI";
import { toast } from "sonner";

interface Stats {
  totalStock: number;
  lowStockCount: number;
  expiringSoonCount: number;
  totalBatches: number;
}

interface TopVariety {
  varietyId: string;
  name: string;
  origin: string;
  grade: string;
  pricePerKg: number;
  isPremium: boolean;
  imageUrl: string | null;
  totalQuantity: number;
  stockPct: number;
  status: "ok" | "low" | "critical";
}

interface Activity {
  id: string;
  type: string;
  timeAgo: string;
  amount: string;
  note: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topVarieties, setTopVarieties] = useState<TopVariety[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getData();
      setStats(res.stats);
      setTopVarieties(res.topVarieties || []);
      setRecentActivity(res.recentActivity || []);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Stock",
      value: stats ? stats.totalStock.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—",
      unit: "kg",
      footer: `${stats?.totalBatches ?? 0} total batches`,
      icon: ClipboardCheck,
      accent: "border-l-primary",
    },
    {
      label: "Low Stock Alerts",
      value: stats ? String(stats.lowStockCount).padStart(2, "0") : "—",
      unit: "Batches",
      footer: "Action required",
      icon: AlertTriangle,
      footerClass: stats?.lowStockCount ? "text-destructive" : "text-muted-foreground",
      valueClass: stats?.lowStockCount ? "text-destructive" : undefined,
    },
    {
      label: "Expiring Soon",
      value: stats ? String(stats.expiringSoonCount).padStart(2, "0") : "—",
      unit: "Batches",
      footer: "Within next 30 days",
      icon: Clock,
      accent: "border-r-gold border-r-4",
    },
    {
      label: "Active Batches",
      value: stats ? String(stats.totalBatches) : "—",
      unit: "Total",
      footer: "In inventory",
      icon: TrendingUp,
      footerClass: "text-olive",
    },
  ];

  return (
    <AppShell action="Quick Sale">
      <PageHeader eyebrow="Real-time Commodity Metrics" title="Inventory Oversight" />

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={[
                    "relative bg-card rounded-2xl p-5 lg:p-6 shadow-card border-l-4 border-l-transparent",
                    s.accent ?? "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                      {s.label}
                    </p>
                    <Icon
                      className={[
                        "h-5 w-5",
                        s.footerClass === "text-destructive"
                          ? "text-destructive"
                          : "text-foreground/40",
                      ].join(" ")}
                    />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className={[
                        "font-serif text-3xl lg:text-5xl tracking-tight",
                        s.valueClass ?? "text-foreground",
                      ].join(" ")}
                    >
                      {s.value}
                    </span>
                    {s.unit && <span className="text-sm text-muted-foreground">{s.unit}</span>}
                  </div>
                  <p
                    className={[
                      "mt-4 text-xs flex items-center gap-1.5",
                      s.footerClass ?? "text-muted-foreground",
                    ].join(" ")}
                  >
                    {s.footer}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="mt-12 grid lg:grid-cols-3 gap-6">
            {/* Varieties */}
            <div className="lg:col-span-2">
              <div className="flex items-end justify-between mb-6">
                <h2 className="font-serif italic text-2xl sm:text-3xl">Signature Varieties</h2>
                <button className="text-[11px] uppercase tracking-[0.22em] text-olive font-semibold hover:underline">
                  View Collection
                </button>
              </div>

              {topVarieties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card rounded-2xl text-muted-foreground">
                  <Package className="h-10 w-10 opacity-30" />
                  <p className="text-sm uppercase tracking-widest">No varieties in stock</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {topVarieties.slice(0, 4).map((v, i) => (
                    <VarietyCard
                      key={v.varietyId}
                      imageUrl={v.imageUrl}
                      name={v.name}
                      meta={`${v.isPremium ? "Premium · " : ""}${v.origin}`}
                      price={String(v.pricePerKg)}
                      stockPct={v.stockPct}
                      status={v.status}
                      tag={v.isPremium ? "Premium Grade" : `Grade ${v.grade}`}
                      tagDark={i % 2 === 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Ledger */}
            <aside className="bg-gradient-espresso text-cream rounded-3xl p-6 lg:p-7 shadow-soft">
              <h3 className="font-serif italic text-2xl mb-6">Recent Arrivals</h3>

              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2 text-cream/40">
                  <Package className="h-8 w-8" />
                  <p className="text-xs uppercase tracking-widest">No recent activity</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {recentActivity.map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <span className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-cream/10 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-gold" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold tracking-wide">#{a.id}</p>
                          <p className="text-sm font-bold text-gold whitespace-nowrap">
                            {a.amount}
                          </p>
                        </div>
                        <p className="text-[11px] text-cream/60 mt-0.5">
                          {a.timeAgo} · {a.type}
                        </p>
                        <p className="text-[11px] text-cream/70 mt-1 italic">{a.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <button className="mt-7 w-full rounded-xl border border-cream/20 py-3 text-[11px] uppercase tracking-[0.22em] hover:bg-cream/5 transition">
                View full batch log
              </button>
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}

function VarietyCard({
  imageUrl,
  name,
  meta,
  price,
  stockPct,
  status,
  tag,
  tagDark,
}: {
  imageUrl: string | null;
  name: string;
  meta: string;
  price: string;
  stockPct: number;
  status: "ok" | "low" | "critical";
  tag: string;
  tagDark?: boolean;
}) {
  return (
    <article className="bg-card rounded-2xl overflow-hidden shadow-card group">
      <div className="relative aspect-[5/3] overflow-hidden bg-cream-deep/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <span
          className={[
            "absolute top-3 right-3 px-3 py-1 rounded-md text-[10px] uppercase tracking-[0.18em] font-semibold",
            tagDark ? "bg-primary text-primary-foreground" : "bg-olive/90 text-cream",
          ].join(" ")}
        >
          {tag}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl">{name}</h3>
          <p className="text-lg">
            <span className="font-semibold">{price}</span>
            <span className="text-xs text-muted-foreground">/kg</span>
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">{meta}</p>
        <div className="mt-5">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={
                status === "critical"
                  ? "h-full bg-destructive"
                  : status === "low"
                    ? "h-full bg-gold"
                    : "h-full bg-olive"
              }
              style={{ width: `${stockPct}%` }}
            />
          </div>
          <p
            className={[
              "text-[11px] mt-2 font-medium",
              status === "critical"
                ? "text-destructive uppercase tracking-wider"
                : status === "low"
                  ? "text-gold"
                  : "text-muted-foreground",
            ].join(" ")}
          >
            {status === "critical" ? "Critical Low" : `${stockPct}% Stock level`}
          </p>
        </div>
      </div>
    </article>
  );
}
