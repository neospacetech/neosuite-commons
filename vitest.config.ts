import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Components are exercised through react-native-web, as on the web target.
    alias: { "react-native": "react-native-web" },
  },
  test: {
    include: ["packages/*/src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
