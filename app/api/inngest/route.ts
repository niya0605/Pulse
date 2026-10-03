import { serve } from "inngest/next";
import { inngest, inngestFunctions } from "@/inngest/exports";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
