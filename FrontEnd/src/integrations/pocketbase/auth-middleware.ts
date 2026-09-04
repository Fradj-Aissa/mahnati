import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import PocketBase from "pocketbase";
import { cleanPocketBaseUrl } from "./url";

export const requirePocketBaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) throw new Response("Unauthorized", { status: 401 });

    const rawUrl = process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL;
    const pb = new PocketBase(cleanPocketBaseUrl(rawUrl));
    pb.authStore.save(token, null);

    try {
      await pb.collection("users").authRefresh();
    } catch {
      throw new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const record = pb.authStore.record as { id: string; role?: string } | null;
    return next({
      context: {
        pb,
        userId: record?.id,
        role: record?.role,
      },
    });
  },
);