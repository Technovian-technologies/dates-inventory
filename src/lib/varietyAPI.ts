import { api } from "./api";

export interface Variety {
  id: string;
  name: string;
  description?: string;
  grade: string;
  origin: string;
  pricePerKg: number;
  isPremium: boolean;
  imageUrl?: string;
  stockLevel: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const varietyAPI = {
  // Create variety
  create: async (data: Partial<Variety>) => {
    const response = await api.post("/varieties", data);
    return response.data;
  },

  // Get all varieties
  getAll: async () => {
    const response = await api.get("/varieties");
    return response.data;
  },

  // Get variety by ID
  getById: async (id: string) => {
    const response = await api.get(`/varieties/${id}`);
    return response.data;
  },
};
