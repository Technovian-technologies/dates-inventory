import { api } from "./api";

export interface CreateBatchData {
  varietyId: string;
  warehouseId: string;
  grade: string;
  origin: string;
  quantity: number;
  unit: string;
  packageType?: string[];
  packageCount?: number;
  receivedDate: string;
  harvestDate: string;
  expiryDate: string;
  notes?: string;
}

export interface UpdateBatchData extends Partial<CreateBatchData> {
  status?: string;
}

export interface Batch {
  id: string;
  batchId: string;
  varietyId: string;
  warehouseId: string;
  grade: string;
  origin: string;
  quantity: number;
  initialQuantity: number;
  unit: string;
  packageType?: string[];
  packageCount?: number;
  receivedDate: string;
  harvestDate: string;
  expiryDate: string;
  status: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const batchAPI = {
  // Create a new batch
  create: async (data: CreateBatchData | FormData) => {
    const response = await api.post("/batches", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  // Get all batches with optional filters
  getAll: async (filters?: {
    varietyId?: string;
    warehouseId?: string;
    status?: string;
    grade?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.varietyId) params.append("varietyId", filters.varietyId);
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.grade) params.append("grade", filters.grade);

    const response = await api.get(`/batches?${params.toString()}`);
    return response.data;
  },

  // Get batch by ID
  getById: async (id: string) => {
    const response = await api.get(`/batches/${id}`);
    return response.data;
  },

  // Get batch by batch ID (e.g., HC-2023-001)
  getByBatchId: async (batchId: string) => {
    const response = await api.get(`/batches/batch-id/${batchId}`);
    return response.data;
  },

  // Update batch
  update: async (id: string, data: UpdateBatchData | FormData) => {
    const response = await api.patch(`/batches/${id}`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  // Update batch quantity
  updateQuantity: async (id: string, quantity: number) => {
    const response = await api.patch(`/batches/${id}/quantity`, { quantity });
    return response.data;
  },

  // Delete batch
  delete: async (id: string) => {
    const response = await api.delete(`/batches/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get("/batches/statistics");
    return response.data;
  },

  // Upload image to existing batch
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/batches/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Remove image from batch
  removeImage: async (id: string) => {
    const response = await api.delete(`/batches/${id}/image`);
    return response.data;
  },
};
