import DOMPurify from "dompurify";
interface Compiled {
  html: string;
  styles: string[];
  syntaxes: string[];
}
let compiler: Promise<{ compile: (source: string) => Promise<Compiled> }>;
export async function compilePreview(source: string): Promise<Compiled> {
  const includes = [
    ...source.matchAll(
      /<!--\s*@include:\s*(?:src\/)?(content\/snippets\/[^\s#{}]+)(?:#([\w.-]+)|\{(\d*)-(\d*)\})?\s*-->/g,
    ),
  ];
  for (const match of includes) {
    const result = await $fetch<{ source: string }>("/api/mock/include", {
      query: { id: match[1] },
    });
    let snippet = result.source;
    if (match[2]) {
      const lines = snippet.split("\n"),
        start = lines.findIndex((l) => l.includes(`region ${match[2]}`)),
        end = lines.findIndex((l, i) => i > start && l.includes("endregion"));
      snippet =
        start >= 0 && end > start
          ? lines.slice(start + 1, end).join("\n")
          : match[0];
    } else if (match[3] || match[4])
      snippet = snippet
        .split("\n")
        .slice(
          Math.max(0, Number(match[3] || 1) - 1),
          match[4] ? Number(match[4]) : undefined,
        )
        .join("\n");
    source = source.replace(match[0], snippet);
  }
  const path = "/preview/compiler.js";
  compiler ||= import(/* @vite-ignore */ path);
  const output = await (await compiler).compile(source);
  return {
    ...output,
    html: DOMPurify.sanitize(output.html, {
      ADD_TAGS: ["annotation"],
      ADD_ATTR: ["popover", "popovertarget"],
    }),
  };
}
