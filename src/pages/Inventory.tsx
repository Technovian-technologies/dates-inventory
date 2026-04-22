import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AddBatchModal } from "@/components/modals/AddBatchModal";
import { EditBatchModal } from "@/components/modals/EditBatchModal";
import {
  ClipboardCheck,
  MapPin,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  Package,
} from "lucide-react";
import { batchAPI, Batch } from "@/lib/batchAPI";
import { toast } from "sonner";
import medjool from "@/assets/medjool.jpg";

export default function InventoryPage() {
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalBatches: 0,
    activeBatches: 0,
    totalQuantity: 0,
  });

  useEffect(() => {
    fetchBatches();
    fetchStatistics();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await batchAPI.getAll();
      setBatches(response.batches || []);
    } catch (error: any) {
      console.error("Failed to fetch batches:", error);
      toast.error("Failed to load batches");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await batchAPI.getStatistics();
      setStatistics(response.statistics);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsEditBatchModalOpen(true);
  };

  const handleDelete = async (batch: Batch) => {
    if (!confirm(`Are you sure you want to delete batch ${batch.batchId}?`)) {
      return;
    }

    try {
      await batchAPI.delete(batch.id);
      toast.success("Batch deleted successfully");
      fetchBatches();
      fetchStatistics();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete batch";
      toast.error(message);
    }
  };

  const handleBatchSuccess = () => {
    fetchBatches();
    fetchStatistics();
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A+" || grade === "A") return "bg-gold text-gold-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      low_stock: { label: "Low Stock", className: "bg-yellow-100 text-yellow-800" },
      expired: { label: "Expired", className: "bg-red-100 text-red-800" },
      depleted: { label: "Depleted", className: "bg-gray-100 text-gray-800" },
    };

    const statusInfo = statusMap[status] || statusMap.active;

    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Archives"
        title="Inventory Ledger"
        action={
          <button
            onClick={() => setIsAddBatchModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold text-gold-foreground px-6 h-12 text-sm font-semibold tracking-tight shadow-soft hover:opacity-95 transition"
          >
            <ClipboardCheck className="h-4 w-4" /> Add New Batch
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        <ValuationCard
          label="Total Batches"
          value={statistics.totalBatches.toString()}
          foot={`${statistics.activeBatches} active batches`}
          footClass="text-olive font-semibold"
        />
        <ValuationCard
          label="Stock on Hand"
          value={parseFloat(String(statistics.totalQuantity)).toFixed(2)}
          unit="kg"
          foot="● Total inventory weight"
          dark
        />
        <div className="bg-card rounded-2xl p-6 shadow-card flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
              Top Variety
            </p>
            <p className="font-serif text-3xl lg:text-4xl mt-3">Medjool</p>
            <p className="text-xs text-muted-foreground mt-1">Grade A Premium</p>
          </div>
          <img src={medjool} alt="" loading="lazy" className="h-20 w-20 rounded-xl object-cover" />
        </div>
      </div>

      <section className="mt-10 bg-card rounded-3xl shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border/60">
          <div className="flex items-center gap-3">
            <h2 className="font-serif italic text-xl">Current Holdings</h2>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {batches.length} entries found
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <button className="inline-flex items-center gap-2 hover:text-foreground">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 hover:text-foreground">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
            <p className="mt-4 text-muted-foreground">Loading batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-24 w-24 rounded-full bg-cream-deep/60 flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-2">No Batches Found</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first batch to the inventory
            </p>
            <button
              onClick={() => setIsAddBatchModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold text-gold-foreground px-6 h-12 text-sm font-semibold tracking-tight shadow-soft hover:opacity-95 transition"
            >
              <ClipboardCheck className="h-4 w-4" /> Add New Batch
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-cream-deep/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="text-left font-medium px-6 py-4">Batch ID</th>
                    <th className="text-left font-medium px-3 py-4">Grade</th>
                    <th className="text-left font-medium px-3 py-4">Origin</th>
                    <th className="text-right font-medium px-3 py-4">Quantity (kg)</th>
                    <th className="text-center font-medium px-3 py-4">Status</th>
                    <th className="text-center font-medium px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="border-t border-border/40 hover:bg-cream-deep/30 transition"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-serif text-lg leading-tight">{batch.batchId}</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                            Variety #{batch.varietyId}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-5">
                        <span
                          className={`inline-flex items-center rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wider ${getGradeColor(
                            batch.grade,
                          )}`}
                        >
                          GRADE {batch.grade}
                        </span>
                      </td>
                      <td className="px-3 py-5 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-foreground/80">
                          <MapPin className="h-3.5 w-3.5 text-olive" /> {batch.origin}
                        </span>
                      </td>
                      <td className="px-3 py-5 text-right font-serif text-lg">
                        {parseFloat(String(batch.quantity)).toFixed(2)}
                      </td>
                      <td className="px-3 py-5 text-center">{getStatusBadge(batch.status)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(batch)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            title="Edit batch"
                          >
                            <Edit2 className="h-4 w-4 text-primary/60 hover:text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(batch)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            title="Delete batch"
                          >
                            <Trash2 className="h-4 w-4 text-red-500/60 hover:text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-t border-border/60">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Showing 1 to {batches.length} of {batches.length} batches
              </p>
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-9 w-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </button>
                <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Add Batch Modal */}
      <AddBatchModal
        isOpen={isAddBatchModalOpen}
        onClose={() => setIsAddBatchModalOpen(false)}
        onSuccess={handleBatchSuccess}
      />

      {/* Edit Batch Modal */}
      <EditBatchModal
        isOpen={isEditBatchModalOpen}
        onClose={() => {
          setIsEditBatchModalOpen(false);
          setSelectedBatch(null);
        }}
        onSuccess={handleBatchSuccess}
        batch={selectedBatch}
      />
    </AppShell>
  );
}

function ValuationCard({
  label,
  value,
  unit,
  foot,
  footClass,
  dark,
}: {
  label: string;
  value: string;
  unit?: string;
  foot: string;
  footClass?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl p-6 shadow-card",
        dark ? "bg-gradient-espresso text-cream" : "bg-card",
      ].join(" ")}
    >
      <p
        className={[
          "text-[11px] uppercase tracking-[0.22em] font-medium",
          dark ? "text-cream/70" : "text-muted-foreground",
        ].join(" ")}
      >
        {label}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <p
          className={[
            "font-serif text-3xl lg:text-4xl tracking-tight",
            dark ? "text-cream" : "text-foreground",
          ].join(" ")}
        >
          {value}
        </p>
        {unit && (
          <span className={dark ? "text-cream/60 text-sm" : "text-muted-foreground text-sm"}>
            {unit}
          </span>
        )}
      </div>
      <p
        className={[
          "mt-4 text-xs",
          footClass ?? (dark ? "text-gold" : "text-muted-foreground"),
        ].join(" ")}
      >
        {foot}
      </p>
    </div>
  );
}
