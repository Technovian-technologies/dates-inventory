import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import {
  TrendingUp,
  AlertTriangle,
  Hourglass,
  Info,
  Filter,
  Download,
  MoreHorizontal,
  Loader2,
  Package,
} from "lucide-react";
import { reportsAPI } from "@/lib/reportsAPI";
import { toast } from "sonner";

interface Summary {
  totalBatches: number;
  activeBatches: number;
  lowStockBatches: number;
  expiredBatches: number;
  depletedBatches: number;
  totalVarieties: number;
  totalQuantity: number;
  stockHealthPct: number;
}

interface TopVariety {
  varietyId: string;
  name: string;
  grade: string;
  totalQuantity: number;
  batchCount: number;
  pct: number;
}

interface ExpiringBatch {
  id: string;
  batchId: string;
  origin: string;
  grade: string;
  quantity: number;
  unit: string;
  daysLeft: number;
  action: "Restock" | "Queue" | "Monitor";
}

interface MonthlyStock {
  label: string;
  totalQuantity: number;
  batchCount: number;
  pct: number;
}

const ACTION_STYLE = {
  Restock: {
    tone: "bg-destructive/10 text-destructive",
    actionClass: "text-destructive",
    icon: AlertTriangle,
  },
  Queue: {
    tone: "bg-gold/25 text-gold-foreground",
    actionClass: "text-olive",
    icon: Hourglass,
  },
  Monitor: {
    tone: "bg-secondary text-secondary-foreground",
    actionClass: "text-muted-foreground",
    icon: Info,
  },
};

const BAR_COLORS = ["bg-olive", "bg-primary", "bg-primary/70", "bg-primary/50", "bg-primary/30"];

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topVarieties, setTopVarieties] = useState<TopVariety[]>([]);
  const [expiring, setExpiring] = useState<ExpiringBatch[]>([]);
  const [monthly, setMonthly] = useState<MonthlyStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, topRes, expiringRes, monthlyRes] = await Promise.all([
        reportsAPI.getSummary(),
        reportsAPI.getTopVarieties(),
        reportsAPI.getExpiringSoon(30),
        reportsAPI.getMonthlyStock(),
      ]);
      setSummary(summaryRes.summary);
      setTopVarieties(topRes.topVarieties || []);
      setExpiring(expiringRes.expiringSoon || []);
      setMonthly(monthlyRes.monthlyStock || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
        </div>
      </AppShell>
    );
  }

  const maxMonthlyQty = Math.max(...monthly.map((m) => m.totalQuantity), 1);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Performance Ledger"
        title="Reports & Analytics"
        action={
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-5 h-10 text-sm font-medium hover:bg-accent transition"
          >
            Refresh
          </button>
        }
      />

      {/* Top Row */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Monthly Stock Chart */}
        <div className="bg-gradient-espresso text-cream rounded-3xl p-7 shadow-soft">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cream/60">
              Monthly Stock Received (kg)
            </p>
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <p className="font-serif text-5xl sm:text-6xl tracking-tight">
              {summary?.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
            </p>
            <p className="inline-flex items-center gap-1 text-gold font-semibold pb-2">
              <TrendingUp className="h-4 w-4" /> Active Stock
            </p>
          </div>
          <div className="mt-8 flex items-end gap-2 sm:gap-3 h-40">
            {monthly.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={[
                    "w-full rounded-t-md transition-all",
                    m.totalQuantity > 0
                      ? "bg-gold shadow-[0_0_20px_oklch(0.84_0.16_88_/_0.3)]"
                      : "bg-cream/15",
                  ].join(" ")}
                  style={{ height: `${Math.max(m.pct, 2)}%` }}
                />
                <span className="text-[9px] text-cream/40">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-3xl p-7 shadow-card flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Inventory Overview
          </p>
          <p className="font-serif text-5xl tracking-tight mt-3">
            {summary?.totalBatches ?? 0} Batches
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {summary?.totalVarieties ?? 0} varieties across {summary?.activeBatches ?? 0} active
            batches currently in vaults.
          </p>
          <div className="mt-auto pt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Stock Health</span>
                <span className="font-bold">{summary?.stockHealthPct ?? 0}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${summary?.stockHealthPct ?? 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Low Stock Alerts</span>
                <span className="font-bold text-destructive">{summary?.lowStockBatches ?? 0}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive"
                  style={{
                    width: summary?.totalBatches
                      ? `${Math.round((summary.lowStockBatches / summary.totalBatches) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        {/* Top Varieties */}
        <section className="bg-card rounded-3xl p-7 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl">Top Varieties by Stock</h3>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
          {topVarieties.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
              <Package className="h-8 w-8 opacity-30" />
              <p className="text-sm">No variety data yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topVarieties.map((v, i) => (
                <div key={v.varietyId}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      {v.name} <span className="text-muted-foreground text-xs">({v.grade})</span>
                    </span>
                    <span className="font-bold">
                      {v.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={["h-full", BAR_COLORS[i] ?? "bg-primary"].join(" ")}
                      style={{ width: `${v.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Expiring Soon */}
        <section className="bg-cream-deep/50 rounded-3xl p-7">
          <h3 className="font-serif text-2xl mb-6">Stock Exhaustion Projection</h3>
          {expiring.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
              <Package className="h-8 w-8 opacity-30" />
              <p className="text-sm">No batches expiring soon</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiring.map((b) => {
                const style = ACTION_STYLE[b.action];
                const Icon = style.icon;
                return (
                  <div
                    key={b.id}
                    className={["flex items-center gap-4 p-4 rounded-2xl", style.tone].join(" ")}
                  >
                    <div className="h-11 w-11 rounded-lg bg-card flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">
                        {b.batchId} — {b.origin}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/70 mt-0.5">
                        Expires in: {b.daysLeft} Days · {b.quantity} {b.unit}
                      </p>
                    </div>
                    <span
                      className={[
                        "text-[11px] uppercase tracking-[0.2em] font-bold",
                        style.actionClass,
                      ].join(" ")}
                    >
                      {b.action}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Batches" value={String(summary?.totalBatches ?? "—")} />
        <StatCard label="Active Batches" value={String(summary?.activeBatches ?? "—")} />
        <StatCard
          label="Low Stock"
          value={String(summary?.lowStockBatches ?? "—")}
          valueClass="text-destructive"
        />
        <StatCard
          label="Expired"
          value={String(summary?.expiredBatches ?? "—")}
          valueClass="text-muted-foreground"
        />
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 text-center shadow-card">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{label}</p>
      <p
        className={["font-serif text-4xl tracking-tight", valueClass ?? "text-foreground"].join(
          " ",
        )}
      >
        {value}
      </p>
    </div>
  );
}
