import PocketBase from "pocketbase";
import { cleanPocketBaseUrl } from "./url";

export const pb = new PocketBase(
  cleanPocketBaseUrl(import.meta.env.VITE_POCKETBASE_URL),
);

pb.autoCancellation(false);