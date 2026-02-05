import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

export function useRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push("/garden");
    } catch (err: any) {
      setError(err.message || "Falha ao registrar. Tente novamente.");
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleRegister
  };
}
