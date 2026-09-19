import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import {siteRemarkPlugins,siteRehypePlugins} from './vendor/utils/markdown-processor.mjs';
import manifest from './vendor/plugins/markdown/manifest.json' with {type:'json'};
export async function compile(source){const processor=unified().use(remarkParse).use(remarkGfm);for(const plugin of siteRemarkPlugins){if(Array.isArray(plugin))processor.use(...plugin);else processor.use(plugin)}processor.use(remarkRehype);for(const plugin of siteRehypePlugins){if(Array.isArray(plugin))processor.use(...plugin);else processor.use(plugin)}const result=await processor.use(rehypeStringify).process({value:source,data:{astro:{frontmatter:{}}}});const syntaxes=result.data.astro.frontmatter.markdownSyntaxes?.syntaxes||[];const styles=[...new Set(manifest.stylesheetPacks.filter(p=>p.syntaxes.some(s=>syntaxes.includes(s))).flatMap(p=>p.styles.map(s=>s.replace('src/styles/','/styles/'))))];if(syntaxes.includes('math'))styles.push('/styles/katex/katex.min.css');return {html:String(result),syntaxes,styles}}
