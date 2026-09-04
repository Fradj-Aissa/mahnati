import PocketBase from "pocketbase";
import { cleanPocketBaseUrl } from "./url";

let adminClient: PocketBase | undefined;

export async function getPbAdmin() {
  if (adminClient?.authStore.isValid) return adminClient;

  const rawUrl = process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL;
  const url = cleanPocketBaseUrl(rawUrl);
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL;
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing POCKETBASE_SUPERUSER_EMAIL or POCKETBASE_SUPERUSER_PASSWORD");
  }

  adminClient = new PocketBase(url);
  await adminClient.collection("_superusers").authWithPassword(email, password);
  adminClient.autoCancellation(false);
  return adminClient;
}