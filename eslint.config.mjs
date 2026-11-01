import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "packages/api-client/src/schema.d.ts",
      "**/next-env.d.ts",
    ],
  },
  { settings: { next: { rootDir: ["apps/marketing/", "apps/citizen/", "apps/office/"] } } },
];
