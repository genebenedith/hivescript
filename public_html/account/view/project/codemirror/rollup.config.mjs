// rollup.config.mjs
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./project.mjs",
  output: {
    file: "./project.bundle.js",
    format: "iife",
  },
  plugins: [nodeResolve()],
};
