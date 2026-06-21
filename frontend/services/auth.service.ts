import api, { tokenStorage } from "@/services/api";
import type { AuthTokens, User } from "@/types";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/login/", payload);
    tokenStorage.set(data.access, data.refresh);
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>("/auth/register/", payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me/");
    return data;
  },

  logout() {
    tokenStorage.clear();
  },

  isAuthenticated() {
    return Boolean(tokenStorage.getAccess());
  },
};
