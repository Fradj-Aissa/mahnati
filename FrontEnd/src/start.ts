import { createStart } from "@tanstack/react-start";
import { attachPocketBaseAuth } from "@/integrations/pocketbase/auth-attacher";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachPocketBaseAuth],
}));
