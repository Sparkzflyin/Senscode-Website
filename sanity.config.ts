import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { codeInput } from "@sanity/code-input";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { StudioNavbar } from "./sanity/components/StudioNavbar";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: "SensCode Studio",
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
  ],
  studio: {
    components: {
      navbar: StudioNavbar,
    },
  },
});
