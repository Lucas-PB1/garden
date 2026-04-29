import type { User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { isGoogleProviderLinked, linkUserWithGoogle } from "../services/authService";

const getGoogleLinkErrorMessage = (error: unknown) => {
  const firebaseError = error as { code?: string };

  switch (firebaseError.code) {
    case "auth/credential-already-in-use":
    case "auth/email-already-in-use":
      return "Essa conta Google já está vinculada a outro usuário.";
    case "auth/provider-already-linked":
      return "Sua conta já está vinculada ao Google.";
    case "auth/popup-closed-by-user":
      return "A janela do Google foi fechada antes de concluir.";
    case "auth/cancelled-popup-request":
      return "Já existe uma tentativa de vínculo em andamento.";
    case "auth/requires-recent-login":
      return "Faça login novamente e tente vincular o Google.";
    default:
      return "Não foi possível vincular sua conta Google. Tente novamente.";
  }
};

export function useGoogleAccountLink(user: User | null) {
  const [isGoogleLinked, setIsGoogleLinked] = useState(() => isGoogleProviderLinked(user));
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  useEffect(() => {
    setIsGoogleLinked(isGoogleProviderLinked(user));
  }, [user]);

  const linkGoogleAccount = useCallback(async () => {
    if (!user) {
      return {
        ok: false,
        message: "Você precisa estar logado para vincular o Google.",
      };
    }

    if (isGoogleProviderLinked(user)) {
      setIsGoogleLinked(true);
      return { ok: true, alreadyLinked: true };
    }

    setLinkingGoogle(true);

    try {
      const linkedUser = await linkUserWithGoogle(user);
      setIsGoogleLinked(isGoogleProviderLinked(linkedUser));
      return { ok: true, alreadyLinked: false };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: getGoogleLinkErrorMessage(error),
      };
    } finally {
      setLinkingGoogle(false);
    }
  }, [user]);

  return {
    isGoogleLinked,
    linkingGoogle,
    linkGoogleAccount,
  };
}
