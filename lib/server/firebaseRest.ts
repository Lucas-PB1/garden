import { createSign } from "crypto";

type FirestoreFields = Record<string, FirestoreValue>;

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: FirestoreFields } };

interface FirestoreDocument {
  name: string;
  fields?: FirestoreFields;
  createTime?: string;
  updateTime?: string;
}

interface ServiceAccountConfig {
  clientEmail: string;
  privateKey: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

const getProjectId = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("Missing FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }

  return projectId;
};

const normalizePrivateKey = (privateKey: string) => privateKey.replace(/\\n/g, "\n");

const parseServiceAccountJson = (value: string | undefined) => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as { client_email?: string; private_key?: string };
    if (!parsed.client_email || !parsed.private_key) return null;

    return {
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch {
    return null;
  }
};

const getServiceAccount = (): ServiceAccountConfig => {
  const inlineJson = parseServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (inlineJson) return inlineJson;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
      "utf8",
    );
    const decodedJson = parseServiceAccountJson(decoded);
    if (decodedJson) return decodedJson;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase service account. Configure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
  }

  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
  };
};

const base64UrlJson = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

const createServiceAccountAssertion = () => {
  const serviceAccount = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlJson({
    iss: serviceAccount.clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  });
  const unsignedJwt = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedJwt);
  signer.end();

  return `${unsignedJwt}.${signer.sign(serviceAccount.privateKey).toString("base64url")}`;
};

const getAccessToken = async () => {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const params = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: createServiceAccountAssertion(),
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not authenticate Firebase service account.");
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
};

const encodeFirestorePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

const getDocumentsBaseUrl = () =>
  `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    getProjectId(),
  )}/databases/(default)/documents`;

const toFirestoreValue = (value: unknown): FirestoreValue => {
  if (value === null) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };

  switch (typeof value) {
    case "boolean":
      return { booleanValue: value };
    case "number":
      if (!Number.isFinite(value)) return { nullValue: null };
      return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    case "string":
      return { stringValue: value };
    case "object":
      return { mapValue: { fields: toFirestoreFields(value as Record<string, unknown>) } };
    default:
      return { nullValue: null };
  }
};

const toFirestoreFields = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)]),
  );

const fromFirestoreValue = (value: FirestoreValue): unknown => {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields || {});
  return null;
};

const fromFirestoreFields = (fields: FirestoreFields) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]),
  );

const documentToData = <T>(document: FirestoreDocument): T & { id: string } => ({
  id: document.name.split("/").pop() || "",
  ...(fromFirestoreFields(document.fields || {}) as T),
});

const firestoreFetch = async (url: string, init: RequestInit = {}) => {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${message.slice(0, 300)}`);
  }

  return response;
};

export const getDocument = async <T>(
  documentPath: string,
): Promise<(T & { id: string }) | null> => {
  const url = `${getDocumentsBaseUrl()}/${encodeFirestorePath(documentPath)}`;
  const token = await getAccessToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Firestore get failed (${response.status}): ${message.slice(0, 300)}`);
  }

  return documentToData<T>((await response.json()) as FirestoreDocument);
};

export const setDocument = async <T extends Record<string, unknown>>(
  documentPath: string,
  data: T,
) => {
  const url = `${getDocumentsBaseUrl()}/${encodeFirestorePath(documentPath)}`;
  const response = await firestoreFetch(url, {
    method: "PATCH",
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  return documentToData<T>((await response.json()) as FirestoreDocument);
};

export const createDocument = async <T extends Record<string, unknown>>(
  collectionPath: string,
  documentId: string,
  data: T,
) => {
  const url = `${getDocumentsBaseUrl()}/${encodeFirestorePath(collectionPath)}?documentId=${encodeURIComponent(
    documentId,
  )}`;
  const response = await firestoreFetch(url, {
    method: "POST",
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  return documentToData<T>((await response.json()) as FirestoreDocument);
};

export const runQuery = async <T>(structuredQuery: Record<string, unknown>) => {
  const response = await firestoreFetch(`${getDocumentsBaseUrl()}:runQuery`, {
    method: "POST",
    body: JSON.stringify({ structuredQuery }),
  });
  const results = (await response.json()) as Array<{ document?: FirestoreDocument }>;

  return results
    .filter((result) => result.document)
    .map((result) => documentToData<T>(result.document as FirestoreDocument));
};
