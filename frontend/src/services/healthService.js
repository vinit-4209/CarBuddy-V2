import api from "./api";

export const checkBackend = async () => {
  const response = await api.get("/api/health/");
  return response.data;
};