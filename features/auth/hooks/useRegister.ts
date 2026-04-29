import { auth } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithGoogle, upsertUserProfile } from "../services/authService";

/**
 * Hook for managing the registration form state and new user creation.
 * Automatically updates the user's display name upon creation.
 * @returns Registration form state and handler.
 */
export function useRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const displayName = name.trim();

    if (!displayName) {
      setError("Informe seu nome para criar a conta.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, { displayName });
      await upsertUserProfile(userCredential.user, { displayName });

      router.push("/dashboard");
    } catch (err) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || "Falha ao registrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError("Não foi possível continuar com Google. Tente novamente.");
      console.error(err);
    } finally {
      setIsGoogleSubmitting(false);
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
    isSubmitting,
    isGoogleSubmitting,
    handleRegister,
    handleGoogleRegister,
  };
}
