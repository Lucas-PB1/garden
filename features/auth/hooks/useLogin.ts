import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithGoogle } from "../services/authService";

const getSafeCallbackUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const callbackUrl = params.get("callbackUrl");

  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }

  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
};

/**
 * Hook for managing the login form state and authentication flow.
 * Redirects to a callback URL or the main garden on success.
 * @returns Login form state and handler.
 */
export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(getSafeCallbackUrl());
    } catch (err) {
      setError("Falha ao entrar. Verifique suas credenciais.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
      router.push(getSafeCallbackUrl());
    } catch (err) {
      setError("Não foi possível entrar com Google. Tente novamente.");
      console.error(err);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    isGoogleSubmitting,
    handleLogin,
    handleGoogleLogin,
  };
}
