import { useState, useEffect, useRef } from "react";
import { X, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import { batchAPI, Batch } from "@/lib/batchAPI";

interface EditBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  batch: Batch | null;
}

export function EditBatchModal({ isOpen, onClose, onSuccess, batch }: EditBatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    harvestDate: "",
    expiryDate: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        varietyId: batch.varietyId.toString(),
        warehouseId: batch.warehouseId.toString(),
        grade: batch.grade,
        origin: batch.origin,
        quantity: batch.quantity.toString(),
        unit: batch.unit,
        packageCount: batch.packageCount?.toString() || "",
        harvestDate: batch.harvestDate.split("T")[0],
        expiryDate: batch.expiryDate.split("T")[0],
        notes: batch.notes || "",
        status: batch.status,
      });

      // Set existing image preview
      if (batch.imageUrl) {
        setImagePreview(batch.imageUrl);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [batch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);

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
    if (!batch) return;

    setIsLoading(true);

    try {
      // If there's a new image file, use FormData
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("varietyId", formData.varietyId);
        formDataToSend.append("warehouseId", formData.warehouseId);
        formDataToSend.append("grade", formData.grade);
        formDataToSend.append("origin", formData.origin);
        formDataToSend.append("quantity", formData.quantity);
        formDataToSend.append("unit", formData.unit);
        if (formData.packageCount) {
          formDataToSend.append("packageCount", formData.packageCount);
        }
        formDataToSend.append("harvestDate", formData.harvestDate);
        formDataToSend.append("expiryDate", formData.expiryDate);
        if (formData.notes) {
          formDataToSend.append("notes", formData.notes);
        }
        formDataToSend.append("status", formData.status);
        formDataToSend.append("image", imageFile);

        await batchAPI.update(batch.id, formDataToSend);
      } else {
        // No new image, send regular JSON
        const updateData: any = {
          varietyId: parseInt(formData.varietyId),
          warehouseId: parseInt(formData.warehouseId),
          grade: formData.grade,
          origin: formData.origin,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          packageCount: formData.packageCount ? parseInt(formData.packageCount) : undefined,
          harvestDate: formData.harvestDate,
          expiryDate: formData.expiryDate,
          notes: formData.notes || undefined,
          status: formData.status,
        };

        await batchAPI.update(batch.id, updateData);
      }

      toast.success("Batch updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update batch";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-6">
      <div className="bg-background shadow-2xl shadow-primary/20 w-full max-w-2xl rounded-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-10 pt-10 pb-6 border-b border-border/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-3xl text-primary font-bold">Edit Batch</h2>
              <p className="text-muted-foreground mt-1">Update batch details - {batch.batchId}</p>
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
                    >
                      <option value="">Select variety</option>
                      <option value="1">Medjool</option>
                      <option value="2">Deglet Noor</option>
                      <option value="3">Barhi</option>
                      <option value="4">Ajwa</option>
                      <option value="5">Sukkari</option>
                    </select>
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
                  >
                    <option value="">Select warehouse</option>
                    <option value="1">Main Storage</option>
                    <option value="2">Cold Storage A</option>
                    <option value="3">Distribution Center</option>
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

            {/* Section 6: Status */}
            <section className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/60 px-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-cream-deep/40 border-none rounded-xl py-4 px-5 text-foreground appearance-none focus:ring-1 focus:ring-gold transition-all"
              >
                <option value="active">Active</option>
                <option value="low_stock">Low Stock</option>
                <option value="expired">Expired</option>
                <option value="depleted">Depleted</option>
              </select>
            </section>

            {/* Section 7: Notes */}
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
            {isLoading ? "Updating..." : "Update Batch"}
          </button>
        </div>
      </div>
    </div>
  );
}
