import "server-only";

import { createPrivateKey } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminInitFailed = false;
let privateKeyWarningShown = false;
let missingConfigWarningShown = false;

function cleanEnv(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function isFirebaseAdminRequired() {
  return process.env.FIREBASE_ADMIN_REQUIRED === "true" || process.env.VERCEL_ENV === "production";
}

export function isDemoFallbackAllowed() {
  return !isFirebaseAdminRequired();
}

function adminConfigError(message: string) {
  return new Error(`${message} Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY correctly.`);
}

function getPrivateKey() {
  const key = cleanEnv(process.env.FIREBASE_PRIVATE_KEY)
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (!key || key.includes("...")) return null;
  if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    return null;
  }

  try {
    createPrivateKey(key);
    return key;
  } catch {
    if (isFirebaseAdminRequired()) {
      throw adminConfigError("FIREBASE_PRIVATE_KEY is not a valid PEM key.");
    }

    if (!privateKeyWarningShown) {
      privateKeyWarningShown = true;
      console.warn("FIREBASE_PRIVATE_KEY is not a valid PEM key. Firebase Admin SDK is disabled for local demo mode.");
    }
    return null;
  }
}

function canInitAdmin() {
  const hasProjectId = Boolean(cleanEnv(process.env.FIREBASE_PROJECT_ID));
  const hasClientEmail = Boolean(cleanEnv(process.env.FIREBASE_CLIENT_EMAIL));
  const privateKey = getPrivateKey();
  const ready = hasProjectId && hasClientEmail && Boolean(privateKey);

  if (!ready && isFirebaseAdminRequired()) {
    throw adminConfigError("Firebase Admin SDK configuration is missing or invalid.");
  }

  if (!ready && !missingConfigWarningShown) {
    missingConfigWarningShown = true;
    console.warn("Firebase Admin SDK is not configured. Using local demo data fallback.");
  }

  return ready;
}

export function getAdminDb() {
  if (adminInitFailed) {
    return null;
  }

  if (!canInitAdmin()) {
    return null;
  }

  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: cleanEnv(process.env.FIREBASE_PROJECT_ID),
          clientEmail: cleanEnv(process.env.FIREBASE_CLIENT_EMAIL),
          privateKey: getPrivateKey() ?? undefined
        })
      });
    } catch {
      adminInitFailed = true;
      if (isFirebaseAdminRequired()) {
        throw adminConfigError("Firebase Admin SDK could not initialize.");
      }

      console.warn("Firebase Admin SDK could not initialize. Using local demo data fallback.");
      return null;
    }
  }

  return getFirestore();
}
