// Assemble www/index.html from src/ (page + logique + données), sans bundler.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";

const src = (f) => readFileSync(new URL("../src/" + f, import.meta.url), "utf8");
const body = src("page.html")
  .replace("/*CORE*/", () => src("core.js"))
  .replace("/*DATA*/", () => src("data.js"))
  .replace("/*MIN*/", () => src("minerals.js"))
  .replace("/*I18N*/", () => src("i18n.js"));

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0D0F13">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;
mkdirSync(new URL("../www/", import.meta.url), { recursive: true });
writeFileSync(new URL("../www/index.html", import.meta.url), html);
cpSync(new URL("../sounds/", import.meta.url), new URL("../www/sounds/", import.meta.url), { recursive: true });
console.log("www/index.html:", (html.length / 1024).toFixed(1), "KB");
