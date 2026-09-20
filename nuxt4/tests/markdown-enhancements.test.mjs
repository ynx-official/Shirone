import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compileMarkdown } from "../scripts/markdown.mjs";

test("compiled tree widgets preserve native state, SVG geometry and style dependencies", async () => {
  const source = await readFile("content/posts/markdown-enhancements.md", "utf8");
  const result = await compileMarkdown(source);
  assert.match(result.html, /<details[^>]+open/);
  assert.match(result.html, /<svg[^>]+viewBox="0 0 24 24"/);
  assert(result.styles.includes("/styles/markdown/disclosures.css"));
  assert(result.styles.includes("/styles/markdown/expressive-code.css"));
  assert.equal(result.styles.length, new Set(result.styles).size);
});

test("plain content does not load widget styles and unsafe links remain filtered", async () => {
  const result = await compileMarkdown("Plain text [unsafe](javascript:alert%281%29).");
  assert.equal(result.styles.length, 0);
  assert(!result.html.includes("javascript:"));
});

test("abbreviation popovers keep their native visibility and SSR explanation", async () => {
  const result = await compileMarkdown("SSR and `SSR`.\n\n*[SSR]: 服务端渲染");
  assert.match(result.html, /popover="manual"/);
  assert.match(result.html, /<abbr[^>]+title="服务端渲染"/);
  assert.match(result.html, /<code>SSR<\/code>/);
  assert(result.styles.includes("/styles/markdown/abbreviations.css"));
});

test("content annotations retain native trigger and popover linkage", async () => {
  const result = await compileMarkdown("正文 [+note]。\n\n[+note]: **补充说明**");
  const target = result.html.match(/popovertarget="([^"]+)"/)?.[1];
  assert(target);
  assert(result.html.includes(`id="${target}"`));
  assert.match(result.html, /<aside[^>]+popover="auto"/);
  assert(result.html.includes("<strong>补充说明</strong>"));
  assert(result.styles.includes("/styles/markdown/content-annotations.css"));
});
