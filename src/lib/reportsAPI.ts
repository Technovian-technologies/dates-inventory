import { api } from "./api";

export const reportsAPI = {
  getSummary: async () => {
    const res = await api.get("/reports/summary");
    return res.data;
  },
  getTopVarieties: async () => {
    const res = await api.get("/reports/top-varieties");
    return res.data;
  },
  getExpiringSoon: async (days = 30) => {
    const res = await api.get(`/reports/expiring-soon?days=${days}`);
    return res.data;
  },
  getMonthlyStock: async () => {
    const res = await api.get("/reports/monthly-stock");
    return res.data;
  },
};
