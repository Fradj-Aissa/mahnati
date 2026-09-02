import PocketBase from "pocketbase";

let adminClient: PocketBase | undefined;

export async function getPbAdmin() {
  if (adminClient?.authStore.isValid) return adminClient;

  const url = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
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