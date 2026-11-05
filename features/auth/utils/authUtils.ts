/**
 * Returns a same-origin callback path from `?callbackUrl=`, or `/dashboard`.
 * Rejects absolute and protocol-relative URLs to prevent open redirects.
 */
export const getSafeCallbackUrl = () => {
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

/** Errors that mean the user simply closed or replaced the Google popup. */
export const isPopupDismissed = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  return code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request";
};

/**
 * Maps Firebase Auth error codes to friendly Portuguese messages.
 */
export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  switch ((error as { code?: string })?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "E-mail ou senha incorretos.";
    case "auth/invalid-email":
      return "Informe um e-mail válido.";
    case "auth/email-already-in-use":
      return "Já existe uma conta com esse e-mail. Tente entrar.";
    case "auth/weak-password":
      return "Use uma senha com pelo menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/network-request-failed":
      return "Sem conexão. Verifique sua internet e tente novamente.";
    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.";
    case "auth/account-exists-with-different-credential":
      return "Esse e-mail já está cadastrado com senha. Entre com e-mail e senha.";
    case "auth/user-disabled":
      return "Esta conta foi desativada.";
    default:
      return fallback;
  }
};
