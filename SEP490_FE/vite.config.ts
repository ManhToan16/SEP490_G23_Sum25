import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-ignore
import { config } from "dotenv";

config();

// Dynamic import for lovable-tagger to handle ESM issues
const getComponentTagger = async () => {
  try {
    const { componentTagger } = await import("lovable-tagger");
    return componentTagger;
  } catch (error) {
    console.warn("lovable-tagger not available, skipping...");
    return null;
  }
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];
  
  // Only add componentTagger in development mode
  if (mode === "development") {
    const componentTagger = await getComponentTagger();
    if (componentTagger) {
      plugins.push(componentTagger() as any);
    }
  }

  return {
  server: {
    host: true,
      port: process.env.PORT ? Number(process.env.PORT) : 8080,
    hmr: {
        overlay: false,
    },
  },
    plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  };
});
