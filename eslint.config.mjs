import type { Linter } from "eslint";

const eslintConfig: Linter.Config[] = [
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
];

export default eslintConfig;
