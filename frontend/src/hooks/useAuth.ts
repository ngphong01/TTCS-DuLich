// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { login, register } from '../services/auth';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: ({ token }: { token: string }) => {
      localStorage.setItem('tg_token', token);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      register(name, email, password),
    onSuccess: ({ token }: { token: string }) => {
      localStorage.setItem('tg_token', token);
    },
  });
}