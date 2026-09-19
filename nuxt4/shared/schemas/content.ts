import { z } from "zod";
export const domains = [
  "posts",
  "categories",
  "tags",
  "series",
  "moments",
  "albums",
  "friends",
  "compass",
  "anime",
  "projects",
  "skills",
  "devices",
  "games",
  "timeline",
  "music",
  "settings",
] as const;
export type Domain = (typeof domains)[number];
export const jsonValue: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValue),
    z.record(
      z
        .string()
        .refine((k) => !["__proto__", "constructor", "prototype"].includes(k)),
      jsonValue,
    ),
  ]),
);
export const entitySchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[\p{L}\p{N}_.\-/]+$/u),
    title: z.string().min(1).max(500),
    description: z.string().default(""),
    body: z.string().default(""),
    date: z.string().default(""),
    status: z.enum(["draft", "published"]).default("published"),
    tags: z.array(z.string()).default([]),
    category: z.string().default(""),
    series: z.string().default(""),
    image: z.string().default(""),
    data: z.record(z.string(), jsonValue).default({}),
  })
  .strict();
export const snapshotSchema = z
  .object({
    version: z.literal(1),
    updatedAt: z.string(),
    collections: z.object(
      Object.fromEntries(
        domains.map((d) => [d, z.array(entitySchema)]),
      ) as Record<Domain, z.ZodArray<typeof entitySchema>>,
    ),
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const domain of domains) {
      const seen = new Set<string>();
      for (const e of value.collections[domain]) {
        if (seen.has(e.id))
          ctx.addIssue({
            code: "custom",
            message: `Duplicate ID: ${domain}/${e.id}`,
          });
        seen.add(e.id);
      }
    }
    const serialized = JSON.stringify(value);
    if (/"(?:password|secret|token|apiKey|privateKey)"\s*:/i.test(serialized))
      ctx.addIssue({
        code: "custom",
        message: "Secret fields are not permitted in browser storage",
      });
  });
export type Entity = z.infer<typeof entitySchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
