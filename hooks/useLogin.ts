import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/garden");
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
    handleLogin
  };
}
