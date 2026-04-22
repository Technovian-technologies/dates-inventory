import { useState, useRef, useEffect } from "react";
import { X, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import { batchAPI } from "@/lib/batchAPI";
import { varietyAPI, Variety } from "@/lib/varietyAPI";
import { warehouseAPI, Warehouse } from "@/lib/warehouseAPI";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddBatchModal({ isOpen, onClose, onSuccess }: AddBatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    varietyId: "",
    warehouseId: "",
    grade: "A+",
    origin: "",
    quantity: "",
    unit: "kg",
    packageCount: "",
    receivedDate: "",
    harvestDate: "",
    expiryDate: "",
    notes: "",
  });

  // Fetch varieties and warehouses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [varietiesRes, warehousesRes] = await Promise.all([
        varietyAPI.getAll(),
        warehouseAPI.getAll(),
      ]);

      setVarieties(varietiesRes.varieties || []);
      setWarehouses(warehousesRes.warehouses || []);
    } catch (error) {
      toast.error("Failed to load varieties and warehouses");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append("varietyId", formData.varietyId);
      formDataToSend.append("warehouseId", formData.warehouseId);
      formDataToSend.append("grade", formData.grade);
      formDataToSend.append("origin", formData.origin);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("unit", formData.unit);
      if (formData.packageCount) {
        formDataToSend.append("packageCount", formData.packageCount);
      }
      formDataToSend.append("receivedDate", new Date().toISOString().split("T")[0]);
      formDataToSend.append("harvestDate", formData.harvestDate);
      formDataToSend.append("expiryDate", formData.expiryDate);
      if (formData.notes) {
        formDataToSend.append("notes", formData.notes);
      }

      // Append image if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await batchAPI.create(formDataToSend);
      toast.success("Batch recorded successfully!");
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to record batch";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      varietyId: "",
      warehouseId: "",
      grade: "A+",
      origin: "",
      quantity: "",
      unit: "kg",
      packageCount: "",
      receivedDate: "",
      harvestDate: "",
      expiryDate: "",
      notes: "",
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-6">
      <div className="bg-background shadow-2xl shadow-primary/20 w-full max-w-2xl rounded-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-10 pt-10 pb-6 border-b border-border/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-3xl text-primary font-bold">New Batch Entry</h2>
              <p className="text-muted-foreground mt-1">Record a new arrival to the vault.</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-primary/40 hover:text-primary transition-colors disabled:opacity-50"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/* Modal Content Form */}
        <div className="px-10 py-6 overflow-y-auto max-h-[500px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Image Upload */}
            <section className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                Batch Image (Optional)
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 bg-cream-deep/40 border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold hover:bg-cream-deep/60 transition-all group"
                  >
                    <Upload className="h-8 w-8 text-primary/40 group-hover:text-gold transition-colors" />
                    <span className="text-sm text-primary/60 group-hover:text-primary transition-colors">
                      Click to upload image
                    </span>
                    <span className="text-xs text-primary/40">PNG, JPG, WebP (Max 5MB)</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </section>

            {/* Section 2: Variety & Grade */}
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Variety
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.varietyId}
                      onChange={(e) => setFormData({ ...formData, varietyId: e.target.value })}
                      className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground appearance-none focus:ring-1 focus:ring-gold transition-all"
                      required
                      disabled={loadingData}
                    >
                      <option value="">{loadingData ? "Loading..." : "Select variety"}</option>
                      {varieties.map((variety) => (
                        <option key={variety.id} value={variety.id}>
                          {variety.name} ({variety.grade})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Grade
                  </label>
                  <div className="flex bg-cream-deep/40 p-1 rounded-xl h-[56px]">
                    {["A+", "A", "B", "C"].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setFormData({ ...formData, grade })}
                        className={`flex-1 rounded-lg font-bold text-sm transition-all ${
                          formData.grade === grade
                            ? "bg-card shadow-sm text-gold"
                            : "text-primary/40 hover:text-primary"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Origin & Warehouse */}
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-gold transition-all"
                    placeholder="e.g. Al Madinah, KSA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Warehouse
                  </label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground appearance-none focus:ring-1 focus:ring-gold transition-all"
                    required
                    disabled={loadingData}
                  >
                    <option value="">{loadingData ? "Loading..." : "Select warehouse"}</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 4: Inventory Details */}
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Total Quantity (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-gold transition-all"
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30 font-bold text-xs">
                      KG
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Package Count
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.packageCount}
                      onChange={(e) => setFormData({ ...formData, packageCount: e.target.value })}
                      className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-gold transition-all"
                      placeholder="0"
                      required
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30 font-bold text-xs">
                      UNITS
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Dates */}
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Harvest Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                      className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground appearance-none focus:ring-1 focus:ring-gold transition-all"
                      required
                    />
                    <Calendar className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                    Expected Expiry
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground appearance-none focus:ring-1 focus:ring-gold transition-all"
                      required
                    />
                    <Calendar className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Notes (Optional) */}
            <section className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-cream-deep/40 border-none rounded-xl py-3 px-5 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-gold transition-all resize-none"
                placeholder="Additional notes about this batch..."
                rows={2}
              />
            </section>
          </form>
        </div>

        {/* Modal Footer: Actions */}
        <div className="px-10 py-6 bg-cream-deep/20 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-sm uppercase tracking-widest font-bold text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gold text-primary px-10 py-5 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? "Recording..." : "Record Batch"}
          </button>
        </div>
      </div>
    </div>
  );
}
