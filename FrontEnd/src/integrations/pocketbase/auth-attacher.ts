import { createMiddleware } from "@tanstack/react-start";
import { pb } from "./client";

export const attachPocketBaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => next({
    headers: pb.authStore.token
      ? { Authorization: `Bearer ${pb.authStore.token}` }
      : {},
  }),
);