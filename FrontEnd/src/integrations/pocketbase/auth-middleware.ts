import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import PocketBase from "pocketbase";

export const requirePocketBaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) throw new Response("Unauthorized", { status: 401 });

    const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");
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