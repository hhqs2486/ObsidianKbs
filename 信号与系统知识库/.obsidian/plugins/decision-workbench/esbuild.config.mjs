import esbuild from "esbuild";
import { existsSync, mkdirSync } from "fs";
import { dirname, resolve, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.argv[2] === "production";

const outDir = resolve(__dirname);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// 路径别名解析插件：@/ → src/，自动探测 .ts 和 /index.ts
const aliasPlugin = {
  name: "alias",
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const rel = args.path.slice(2);
      const basePath = resolve(__dirname, "src", rel);
      const candidates = [
        basePath,
        basePath + ".ts",
        basePath + ".js",
        join(basePath, "index.ts"),
        join(basePath, "index.js"),
      ];
      for (const c of candidates) {
        if (existsSync(c)) return { path: c };
      }
      return { path: basePath };
    });
  },
};

const context = await esbuild.context({
  entryPoints: [resolve(__dirname, "main.ts")],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/highlight",
    "@lezer/lr",
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: isProd ? false : "inline",
  treeShaking: true,
  outfile: resolve(outDir, "main.js"),
  plugins: [aliasPlugin],
});

if (isProd) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
