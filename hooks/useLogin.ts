import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Hook for managing the login form state and authentication flow.
 * Redirects to a callback URL or the main garden on success.
 * @returns Login form state and handler.
 */
export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");

      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/garden");
      }
    } catch (err) {
      setError("Falha ao entrar. Verifique suas credenciais.");
      console.error(err);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleLogin,
  };
}
