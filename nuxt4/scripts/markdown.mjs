import {highlight} from './code-renderer.mjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { siteRemarkPlugins, siteRehypePlugins } from './vendor/utils/markdown-processor.mjs';
import manifest from './vendor/plugins/markdown/manifest.json' with {type:'json'};
import sanitizeHtml from 'sanitize-html';
export async function compileMarkdown(source,path='content/preview.md') {
 const processor=unified().use(remarkParse).use(remarkGfm);
 for(const plugin of siteRemarkPlugins) { if(Array.isArray(plugin))processor.use(...plugin);else processor.use(plugin); }
 processor.use(remarkRehype);
 for(const plugin of siteRehypePlugins) { if(Array.isArray(plugin))processor.use(...plugin);else processor.use(plugin); }
 const file=await processor.use(highlight).use(rehypeStringify).process({value:source,path,data:{astro:{frontmatter:{}}}});
 const html=sanitizeHtml(String(file),{allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','figure','figcaption','details','summary','mark','abbr','button','input','div','section','header','video','audio','source','svg','path','g','circle','rect','line','polyline','polygon','math','semantics','annotation','mrow','mi','mo','mn','msup','msub','mfrac','mspace','mtext','msqrt','mtable','mtr','mtd'],allowedAttributes:{'*':['class','id','title','role','aria-*','data-*','style','hidden','tabindex'],a:['href','target','rel'],img:['src','alt','width','height','loading'],button:['type'],input:['type','checked','disabled'],svg:['viewBox','xmlns','width','height'],path:['d','fill'],source:['src','type'],video:['src','controls','preload'],audio:['src','controls','preload'],annotation:['encoding']},allowedSchemes:['http','https','mailto','tel'],allowProtocolRelative:false});
 const syntaxes=file.data.astro.frontmatter.markdownSyntaxes?.syntaxes||[];
 const styles=[...new Set(manifest.stylesheetPacks.filter(p=>p.syntaxes.some(s=>syntaxes.includes(s))).flatMap(p=>p.styles.map(s=>s.replace('src/styles/','/styles/'))))];
 if(syntaxes.includes('math')) styles.push('/styles/katex/katex.min.css');
 if(html.includes('expressive-code')){styles.push('/styles/expressive-engine.css');if(!syntaxes.includes('expressive-code'))syntaxes.push('expressive-code');}
 const toc=[...html.matchAll(/<h([1-6])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(m=>({depth:Number(m[1]),id:m[2],text:m[3].replace(/<[^>]*>/g,'').replace(/#$/,'').trim()}));
 return {html,toc,syntaxes,styles,words:file.data.astro.frontmatter.words||0,minutes:file.data.astro.frontmatter.minutes||1};
}
