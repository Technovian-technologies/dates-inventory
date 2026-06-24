import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { varietyAPI, Variety } from "@/lib/varietyAPI";
import { warehouseAPI, Warehouse } from "@/lib/warehouseAPI";
import { PageHeader } from "@/components/PageHeader";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"varieties" | "warehouses">("varieties");
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [varietiesRes, warehousesRes] = await Promise.all([
        varietyAPI.getAll(),
        warehouseAPI.getAll(),
      ]);
      setVarieties(varietiesRes.varieties || []);
      setWarehouses(warehousesRes.warehouses || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <PageHeader eyebrow="Configuration" title="Settings" />

      <div className="mt-8 max-w-6xl mx-auto">
        <div className="flex gap-4 border-b border-border/20 mb-8">
          <button
            onClick={() => setActiveTab("varieties")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "varieties"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Varieties ({varieties.length})
          </button>
          <button
            onClick={() => setActiveTab("warehouses")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "warehouses"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Warehouses ({warehouses.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <>
            {activeTab === "varieties" && (
              <VarietiesSection varieties={varieties} onRefresh={fetchData} />
            )}
            {activeTab === "warehouses" && (
              <WarehousesSection warehouses={warehouses} onRefresh={fetchData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function VarietiesSection({
  varieties,
  onRefresh,
}: {
  varieties: Variety[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grade: "A+",
    origin: "",
    pricePerKg: "",
    isPremium: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await varietyAPI.create({
        ...formData,
        pricePerKg: parseFloat(formData.pricePerKg),
      });
      toast.success("Variety added!");
      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        grade: "A+",
        origin: "",
        pricePerKg: "",
        isPremium: false,
      });
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add variety");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Date Varieties</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold text-primary px-6 py-3 rounded-xl font-bold hover:scale-95 transition-transform flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {showForm ? "Cancel" : "Add Variety"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl mb-6 border border-gold/30">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name (e.g., Medjool)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
              required
            />
            <input
              type="text"
              placeholder="Origin (e.g., Saudi Arabia)"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
              required
            />
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
            >
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Price per kg"
              value={formData.pricePerKg}
              onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2 col-span-2"
              rows={2}
            />
            <label className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              />
              <span>Premium Variety</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gold text-primary px-6 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Variety"}
          </button>
        </form>
      )}

      {varieties.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl">
          <p className="text-lg">No varieties found</p>
          <p className="text-sm mt-2">Add your first variety to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {varieties.map((variety) => (
            <div key={variety.id} className="bg-card p-6 rounded-xl border border-border/10">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{variety.name}</h3>
                  <p className="text-sm">{variety.description}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>Grade: {variety.grade}</span>
                    <span>Origin: {variety.origin}</span>
                    <span>Price: ${variety.pricePerKg}/kg</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WarehousesSection({
  warehouses,
  onRefresh,
}: {
  warehouses: Warehouse[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "dry_storage",
    location: "",
    capacity: "",
    temperature: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await warehouseAPI.create({
        ...formData,
        capacity: parseFloat(formData.capacity),
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      });
      toast.success("Warehouse added!");
      setShowForm(false);
      setFormData({ name: "", type: "dry_storage", location: "", capacity: "", temperature: "" });
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add warehouse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Warehouses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold text-primary px-6 py-3 rounded-xl font-bold hover:scale-95 transition-transform flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {showForm ? "Cancel" : "Add Warehouse"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl mb-6 border border-gold/30">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name (e.g., Main Storage)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
            >
              <option value="dry_storage">Dry Storage</option>
              <option value="cold_storage">Cold Storage</option>
              <option value="distribution">Distribution</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Capacity (kg)"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
              required
            />
            <input
              type="number"
              step="0.1"
              placeholder="Temperature (°C) - optional"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gold text-primary px-6 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Warehouse"}
          </button>
        </form>
      )}

      {warehouses.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl">
          <p className="text-lg">No warehouses found</p>
          <p className="text-sm mt-2">Add your first warehouse to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-card p-6 rounded-xl border border-border/10">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{warehouse.name}</h3>
                  <p className="text-sm">{warehouse.location}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>Type: {warehouse.type.replace("_", " ")}</span>
                    <span>Capacity: {warehouse.capacity} kg</span>
                    {warehouse.temperature && <span>Temp: {warehouse.temperature}°C</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
