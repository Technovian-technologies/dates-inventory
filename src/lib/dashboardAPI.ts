import { api } from "./api";

export const dashboardAPI = {
  getData: async () => {
    const res = await api.get("/dashboard");
    return res.data;
  },
};
