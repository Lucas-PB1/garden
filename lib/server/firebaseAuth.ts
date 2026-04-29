import type { NextRequest } from "next/server";

export interface VerifiedFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const splitEnvList = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const getBearerToken = (request: NextRequest) => {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim();
};

export const verifyFirebaseToken = async (idToken: string): Promise<VerifiedFirebaseUser> => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new HttpError(401, "Token de autenticação inválido.");
  }

  const data = (await response.json()) as {
    users?: Array<{
      localId?: string;
      email?: string;
      displayName?: string;
      emailVerified?: boolean;
    }>;
  };
  const user = data.users?.[0];

  if (!user?.localId) {
    throw new HttpError(401, "Token de autenticação inválido.");
  }

  return {
    uid: user.localId,
    email: user.email || null,
    displayName: user.displayName || null,
    emailVerified: Boolean(user.emailVerified),
  };
};

export const requireAuth = async (request: NextRequest) => {
  const token = getBearerToken(request);

  if (!token) {
    throw new HttpError(401, "Faça login para continuar.");
  }

  return verifyFirebaseToken(token);
};

export const isAdminUser = (user: VerifiedFirebaseUser) => {
  const adminUids = new Set(splitEnvList(process.env.ADMIN_UIDS));
  const adminEmails = new Set(
    splitEnvList(process.env.ADMIN_EMAILS).map((email) => email.toLowerCase()),
  );
  const normalizedEmail = user.email?.toLowerCase() || "";

  return adminUids.has(user.uid) || Boolean(normalizedEmail && adminEmails.has(normalizedEmail));
};

export const requireAdmin = async (request: NextRequest) => {
  const user = await requireAuth(request);

  if (!isAdminUser(user)) {
    throw new HttpError(403, "Acesso restrito ao administrador.");
  }

  return user;
};
