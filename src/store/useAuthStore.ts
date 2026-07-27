import { create } from "zustand";
import type { AuthUser } from "../models";
import * as authRepository from "../data/repositories/authRepository";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authRepository.login(email, password);
      set({ user, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      set({ isLoading: false, error: message });
    }
  },
  logout: () => {
    set({ user: null, error: null });
    void authRepository.logout();
  },
}));
