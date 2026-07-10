import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "dist/**",
      "node_modules/**",
      "js/**",
      "scripts/**/*.js",
      "mcps/**"
    ]
  }
];

export default eslintConfig;
