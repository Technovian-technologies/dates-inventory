import { api } from "./api";

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  currentStock: number;
  temperature?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const warehouseAPI = {
  // Create warehouse
  create: async (data: Partial<Warehouse>) => {
    const response = await api.post("/warehouses", data);
    return response.data;
  },

  // Get all warehouses
  getAll: async () => {
    const response = await api.get("/warehouses");
    return response.data;
  },

  // Get warehouse by ID
  getById: async (id: string) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },
};
