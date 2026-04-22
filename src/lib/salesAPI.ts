import { api } from "./api";

export interface SaleItem {
  varietyId: string;
  batchId: string;
  quantity: number;
  unit: string;
  pricePerKg: number;
}

export interface ClientInfo {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface CreateSalePayload {
  client: ClientInfo;
  items: SaleItem[];
  paymentMethod: "cash" | "card" | "transfer";
  discount?: number;
  tax?: number;
  promoCode?: string;
  notes?: string;
}

export const salesAPI = {
  create: async (data: CreateSalePayload) => {
    const res = await api.post("/sales", data);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get("/sales");
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/sales/${id}`);
    return res.data;
  },
  getActiveBatches: async () => {
    const res = await api.get("/sales/active-batches");
    return res.data;
  },
};
