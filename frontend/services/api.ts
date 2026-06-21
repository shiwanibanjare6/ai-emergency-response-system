import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/constants";

const ACCESS_KEY = "ers_access";
const REFRESH_KEY = "ers_refresh";

export const tokenStorage = {
  getAccess: () => Cookies.get(ACCESS_KEY) ?? null,
  getRefresh: () => Cookies.get(REFRESH_KEY) ?? null,
  set: (access: string, refresh: string) => {
    Cookies.set(ACCESS_KEY, access, { expires: 1 });
    Cookies.set(REFRESH_KEY, refresh, { expires: 7 });
  },
  clear: () => {
    Cookies.remove(ACCESS_KEY);
    Cookies.remove(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${API_URL}/api/auth/refresh/`, { refresh });
    tokenStorage.set(data.access, refresh);
    return data.access as string;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
