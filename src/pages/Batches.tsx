import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import {
  Filter,
  Upload,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  Network,
  Plus,
  Loader2,
  Package,
} from "lucide-react";
import warehouse from "@/assets/warehouse.jpg";
import { batchAPI, Batch } from "@/lib/batchAPI";
import { AddBatchModal } from "@/components/modals/AddBatchModal";
import { toast } from "sonner";

const GRADE_CLASS: Record<string, string> = {
  "A+": "bg-gold/30 text-gold-foreground",
  A: "bg-secondary text-secondary-foreground",
  B: "bg-secondary text-secondary-foreground",
  C: "bg-secondary text-secondary-foreground",
};

const STATUS_LEVEL: Record<string, number> = {
  active: 75,
  low_stock: 20,
  depleted: 0,
  expired: 5,
};

const STATUS_LEVEL_CLASS: Record<string, string> = {
  active: "bg-olive",
  low_stock: "bg-destructive",
  depleted: "bg-muted-foreground",
  expired: "bg-destructive",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [statistics, setStatistics] = useState<{
    totalBatches: number;
    activeBatches: number;
    lowStockBatches: number;
    expiredBatches: number;
    totalQuantity: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchRes, statsRes] = await Promise.all([
        batchAPI.getAll(filterStatus ? { status: filterStatus } : undefined),
        batchAPI.getStatistics(),
      ]);
      setBatches(batchRes.batches || []);
      setStatistics(statsRes.statistics || null);
    } catch (error) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const lowStockCount = batches.filter((b) => b.status === "low_stock").length;
  const totalQty = statistics?.totalQuantity ?? 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inventory Ledger"
        title="Batches & Stock Management"
        action={
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-5 h-12 text-sm font-medium hover:bg-accent transition"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="low_stock">Low Stock</option>
              <option value="expired">Expired</option>
              <option value="depleted">Depleted</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-olive text-cream px-5 h-12 text-sm font-semibold tracking-tight hover:opacity-90 transition shadow-soft"
            >
              <Plus className="h-4 w-4" /> New Batch
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Batch Table */}
        <section className="bg-card rounded-3xl shadow-card overflow-hidden">
          <div className="bg-gradient-espresso text-cream grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr] gap-3 px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-medium">
            <span>Batch ID</span>
            <span>Variety & Grade</span>
            <span>Package</span>
            <span>Stock Level</span>
            <span>Expires In</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Package className="h-12 w-12 opacity-30" />
              <p className="text-sm uppercase tracking-widest">No batches found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                {batches.map((b) => {
                  const days = daysUntil(b.expiryDate);
                  const isLow = b.status === "low_stock" || b.status === "depleted";
                  const level = STATUS_LEVEL[b.status] ?? 50;
                  const levelClass = STATUS_LEVEL_CLASS[b.status] ?? "bg-olive";
                  const qty = parseFloat(String(b.quantity));
                  const initQty = parseFloat(String(b.initialQuantity));
                  const pct = initQty > 0 ? Math.round((qty / initQty) * 100) : level;

                  return (
                    <div
                      key={b.id}
                      className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr] gap-3 px-6 py-6 border-b border-border/40 last:border-0 items-center hover:bg-cream-deep/30 transition"
                    >
                      {/* Batch ID */}
                      <div>
                        <p className="font-bold text-sm">#{b.batchId}</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                          Rec.{" "}
                          {new Date(b.receivedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Variety & Grade */}
                      <div className="flex items-center gap-3">
                        {b.imageUrl ? (
                          <img
                            src={b.imageUrl}
                            alt={b.batchId}
                            loading="lazy"
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-cream-deep/60 flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-serif text-base leading-tight">{b.origin}</p>
                          <span
                            className={[
                              "inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] uppercase tracking-[0.16em] font-bold",
                              GRADE_CLASS[b.grade] ?? "bg-secondary text-secondary-foreground",
                            ].join(" ")}
                          >
                            Grade {b.grade}
                          </span>
                        </div>
                      </div>

                      {/* Package */}
                      <div className="flex flex-wrap gap-1">
                        {b.packageType?.length ? (
                          b.packageType.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-1 bg-secondary text-[10px] rounded-md tracking-wide"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-secondary text-[10px] rounded-md tracking-wide">
                            {b.unit}
                          </span>
                        )}
                        {b.packageCount && (
                          <span className="px-2 py-1 bg-secondary text-[10px] rounded-md tracking-wide">
                            ×{b.packageCount}
                          </span>
                        )}
                      </div>

                      {/* Stock Level */}
                      <div>
                        <p className="font-serif text-lg">
                          {qty.toFixed(0)}{" "}
                          <span className="text-xs text-muted-foreground">{b.unit}</span>
                        </p>
                        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={["h-full", levelClass].join(" ")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Expires In */}
                      <div className="flex items-start gap-2">
                        <div>
                          <p
                            className={[
                              "font-serif text-lg leading-tight",
                              days <= 14 ? "text-destructive font-semibold" : "",
                            ].join(" ")}
                          >
                            {days} Days
                          </p>
                          <p
                            className={[
                              "text-[10px] uppercase tracking-[0.18em] mt-1",
                              days <= 14
                                ? "text-destructive font-semibold"
                                : "text-muted-foreground italic",
                            ].join(" ")}
                          >
                            {days === 0
                              ? "Expired"
                              : days <= 14
                                ? "Restock Required"
                                : days <= 30
                                  ? "Expiring Soon"
                                  : "Shelf Life Stable"}
                          </p>
                        </div>
                        {isLow && (
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-gradient-espresso text-cream rounded-3xl p-6 shadow-soft">
            <h3 className="font-serif text-2xl mb-5">Stock Health Index</h3>
            <Bar
              label="Active Batches"
              value={
                statistics
                  ? Math.round(
                      (statistics.activeBatches / Math.max(statistics.totalBatches, 1)) * 100,
                    )
                  : 0
              }
            />
            <Bar
              label="Stock Remaining"
              value={
                statistics
                  ? Math.min(
                      100,
                      Math.round(
                        (statistics.totalQuantity /
                          Math.max(
                            statistics.totalQuantity + statistics.lowStockBatches * 100,
                            1,
                          )) *
                          100,
                      ),
                    )
                  : 0
              }
            />
            <div className="mt-6 pt-6 border-t border-cream/15 flex items-end justify-between">
              <div>
                <p className="font-serif text-3xl">
                  {parseFloat(String(totalQty)).toLocaleString()} kg
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cream/60 mt-1">
                  Total Stock on Hand
                </p>
              </div>
              <TrendingUp className="h-7 w-7 text-gold" />
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-card">
            <h3 className="font-serif text-xl mb-5">Batch Overview</h3>
            <div className="space-y-3">
              <DistRow
                icon={Thermometer}
                label="Active Batches"
                capacity={statistics?.activeBatches ?? 0}
                total={statistics?.totalBatches ?? 0}
              />
              <DistRow
                icon={Network}
                label="Low Stock Alerts"
                capacity={statistics?.lowStockBatches ?? 0}
                total={statistics?.totalBatches ?? 0}
                muted
              />
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-card aspect-[4/3]">
            <img
              src={warehouse}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
            <button
              onClick={() => setShowAddModal(true)}
              className="absolute top-4 right-4 h-10 w-10 rounded-lg bg-olive flex items-center justify-center text-cream hover:scale-105 transition"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="absolute bottom-0 left-0 p-5 text-cream">
              <p className="font-serif text-xl leading-snug">
                Record a new batch arrival into the vault.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-[10px] uppercase tracking-[0.22em] text-gold font-semibold"
              >
                Add New Batch →
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Stats */}
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Batches" value={String(statistics?.totalBatches ?? "—")} />
        <Stat label="Active Batches" value={String(statistics?.activeBatches ?? "—")} />
        <Stat
          label="Low Stock Alerts"
          value={String(statistics?.lowStockBatches ?? "—")}
          valueClass="text-destructive"
        />
        <Stat
          label="Expired Batches"
          value={String(statistics?.expiredBatches ?? "—")}
          valueClass="text-muted-foreground"
        />
      </div>

      <AddBatchModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
    </AppShell>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] mb-2">
        <span className="text-cream/70">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-1.5 bg-cream/10 rounded-full overflow-hidden">
        <div className="h-full bg-gold" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DistRow({
  icon: Icon,
  label,
  capacity,
  total,
  muted,
}: {
  icon: typeof Thermometer;
  label: string;
  capacity: number;
  total: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-deep/40">
      <span className={["h-8 w-1 rounded-full", muted ? "bg-primary/60" : "bg-olive"].join(" ")} />
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {capacity} of {total}
        </p>
      </div>
      <Icon className="h-5 w-5 text-foreground/50" />
    </div>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
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
