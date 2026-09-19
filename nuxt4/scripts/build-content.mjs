import {prepareImage} from './images.mjs';
await import('./generate-moment-thumbnails.mjs');
import { readFile,writeFile,mkdir,readdir,copyFile,cp,rm } from 'node:fs/promises';
import { join,dirname,relative,resolve } from 'node:path';
import matter from 'gray-matter';
import { webcrypto } from 'node:crypto';
import {writeCodeStyles} from './code-renderer.mjs';
import { compileMarkdown } from './markdown.mjs';
import { createIndex } from 'pagefind';
import { parse } from 'yaml';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
await import('./build-preview.mjs');
const config=JSON.parse(await readFile('mock/public/config.json','utf8'));
const rawData=JSON.parse(await readFile('mock/public/data.json','utf8'));
const domains=['posts','categories','tags','series','moments','albums','friends','compass','anime','projects','skills','devices','games','timeline','music','settings'];
const collections=Object.fromEntries(domains.map(d=>[d,[]]));
const entity=(id,title,data={})=>({id:String(id),title:String(title),description:'',body:'',date:'',status:'published',tags:[],category:'',series:'',image:'',data});
await mkdir('.generated',{recursive:true});
const includeRegistry={};for(const file of await walk('content/snippets'))if(file.endsWith('.md'))includeRegistry[file]=await readFile(file,'utf8');await writeFile('.generated/includes.json',JSON.stringify(includeRegistry));
await mkdir('public/content-assets',{recursive:true});
await cp('node_modules/katex/dist','public/styles/katex',{recursive:true});
const b64=(v)=>Buffer.from(v).toString('base64');
async function encrypt(value,password){const salt=webcrypto.getRandomValues(new Uint8Array(16)),iv=webcrypto.getRandomValues(new Uint8Array(12));const material=await webcrypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);const key=await webcrypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt']);return {salt:b64(salt),iv:b64(iv),data:b64(await webcrypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(value))))}}
async function walk(dir){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())out.push(...await walk(path));else out.push(path)}return out}
const normalize=(s)=>'/'+s.replace(/^\/+|\/+$/g,'')+'/';
const reserved=new Set(['admin','api','archive','tags','categories','series','albums','moments','friends','compass','anime','projects','skills','devices','games','timeline','about','rss','atom','search']);
const posts=[], paths={}, spec={};
for(const file of await walk('content')){
 if(!/\.(md|mdx)$/.test(file)) continue;
 const {data,content}=matter(await readFile(file,'utf8'));
 const group=file.split('/')[1]; const id=relative(`content/${group}`,file).replace(/\.(md|mdx)$/,'').replace(/\/index$/,'').toLowerCase();
 if(data.draft) continue;
 if(data.encrypted && !String(data.password||'').trim())throw Error(`Missing encryption password: ${file}`);
 let body=content;
 if(file.endsWith('.mdx') && id !== 'mdx-showcase')throw Error(`MDX requires an explicit Vue migration: ${file}`);
 if(file.endsWith('.mdx'))body='# Vue component showcase\n\nThe original Svelte MDX example is migrated to native Vue components.\n\n:::tip\nThis page uses the same Material design tokens as the blog.\n:::\n';
 body=body.replaceAll('src/content/','content/');
 // Relative assets remain scoped to their source article and are copied, never parent-imported.
 const assets=await readdir(dirname(file));
 for(const asset of assets){if(!/\.(webp|png|jpe?g|gif|svg|avif|mp3|mp4)$/i.test(asset))continue;const dest=join('public/content-assets',group,id,asset);await mkdir(dirname(dest),{recursive:true});await copyFile(join(dirname(file),asset),dest);body=body.replaceAll(`](./${asset})`,`](/content-assets/${group}/${id}/${asset})`).replaceAll(`](${asset})`,`](/content-assets/${group}/${id}/${asset})`)}
 const expandedSource=body.replace(/(<!--\s*@include:\s*)(content\/snippets\/[^\s#{}]+)/g,(_,prefix,path)=>prefix+resolve(path));
 const compiled=await compileMarkdown(expandedSource,file);
 if(group==='spec'){spec[id]=compiled.html;continue}
 if(group==='series'){collections.series.push({...entity(id,data.title||id,data),body,...compiled});continue}
 if(group==='moments'){if(data.images)data.images=await Promise.all(data.images.map(image=>prepareImage(image)));collections.moments.push({...entity(id,data.title||id),description:body,date:new Date(data.published||'2026-01-01').toISOString(),body,data:{...data,html:compiled.html},tags:data.tags||[]});continue}
 if(group!=='posts')continue;
 const protectedPost=Boolean(data.password);
 const url=data.permalink?normalize(data.permalink):normalize(`posts/${data.alias||id}`);
 if(reserved.has(url.split('/')[1])||/^\/\d+\/$/.test(url))throw Error(`Reserved URL: ${url}`);
 for(const route of new Set([url,normalize(`posts/${id}`)])){if(paths[route])throw Error(`Duplicate URL ${route}`);paths[route]=url}
 const post={id,title:data.title||id,description:data.description||'',published:new Date(data.publishedAt||data.published||'2026-01-01').toISOString(),tags:data.tags||[],category:data.category||'',series:data.series||'',image:data.image?.startsWith('./')?`/content-assets/${group}/${id}/${data.image.slice(2)}`:data.image||'',url,pinned:Boolean(data.pinned),protected:protectedPost,comment:data.comment!==false,minutes:compiled.minutes,words:compiled.words,hideHomeContent:Boolean(data.hideHomeContent)};
 if(protectedPost){post.cipher=await encrypt(compiled,String(data.password));post.passwordHint=data.passwordHint||''}else Object.assign(post,compiled);
 posts.push(post);
 if(!protectedPost)collections.posts.push({...entity(id,post.title),description:post.description,body,date:post.published,tags:post.tags,category:post.category,series:post.series,image:post.image,data:{url,pinned:post.pinned}});
}
await writeCodeStyles();
posts.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.published.localeCompare(a.published));
for(const [domain,items] of Object.entries(rawData)){if(!collections[domain])continue;collections[domain]=items.map((d,i)=>({...entity(d.key||d.id||String(i+1),d.title||d.name||d.label||d.key||String(i+1),d),description:d.summary||d.description||d.desc||d.note||d.blurb||'',date:d.date||'',image:(d.cover||d.image||d.imgurl||'').replace(/^assets\//,'/assets/'),category:d.category||'',tags:d.tags||[]}))}
for(const [domain,field] of [['categories','category'],['tags','tags']])collections[domain]=[...new Set(posts.flatMap(p=>Array.isArray(p[field])?p[field]:[p[field]]).filter(Boolean))].map((v,i)=>entity(String(i+1),v));
for(const [folder,d] of Object.entries(JSON.parse(await readFile('mock/admin/albums.json','utf8')))){
 try{const dir=`public/images/albums/${folder}`;const protectedAlbum=Boolean(d.password||d.encrypted);if(d.hidden)continue;
 const photos=(await readdir(dir)).filter(f=>/\.(webp|png|jpe?g|avif)$/i.test(f)&&!/^cover\./i.test(f)).sort().map(f=>({src:`/images/albums/${folder}/${f}`,alt:d.title||folder}));
 const preparedPhotos=await Promise.all((d.photos||photos).map(image=>prepareImage(image,true)));
 const clean={...d};delete clean.password;delete clean.encrypted;
 const coverFiles=(await readdir(dir)).filter(f=>/^cover\.(webp|png|jpe?g|avif)$/i.test(f));
 const cover=d.cover || (coverFiles[0]?`/images/albums/${folder}/${coverFiles[0]}`:'');
 const e={...entity(folder,d.title||folder),image:cover,description:d.description||'',date:d.date||'',tags:d.tags||[],data:clean};
 if(protectedAlbum){if(!d.password)throw Error('Missing album password');e.data={protected:true,location:d.location||'',layout:d.layout||'masonry',columns:d.columns||3,cipher:await encrypt({photos:preparedPhotos},String(d.password))};}else e.data.photos=preparedPhotos;
 if(!protectedAlbum) collections.albums.push(e); else { collections.albums.push(e); }
 }catch(e){if(e.code!=='ENOENT')throw e}
}
collections.albums.sort((a,b)=>b.date.localeCompare(a.date));
// Never ship source metadata (including album passwords) under public/.
for(const folder of Object.keys(JSON.parse(await readFile('mock/admin/albums.json','utf8'))))await rm(`public/images/albums/${folder}/info.json`,{force:true});
collections.settings=Object.entries(config).map(([key,value])=>entity(key,key,value));
const site={title:config.site.title,subtitle:config.site.subtitle,url:config.site.site,lang:config.site.lang,avatar:'/assets/images/demo-avatar.webp',bio:config.profile.bio,banner:'/assets/images/banner/desktop/1.webp',pages:['archive','tags','categories','series',...Object.keys(rawData).filter(k=>k!=='music'),'moments','albums','about'],links:[{label:'home',url:'/'},{label:'archive',url:'/archive/'},{label:'moments',url:'/moments/'},{label:'albums',url:'/albums/'},{label:'about',url:'/about/'}]};
site.widgets=config.sidebar.enable?config.sidebar.components:[];site.arrangement=config.sidebar.arrangement;site.sidebarEnabled=config.sidebar.enable;site.announcement=config.announcement;site.contextMenu=config.contextMenu.enable;site.stats={posts:posts.length,dates:posts.map(p=>p.published),words:posts.reduce((sum,p)=>sum+(p.html?.replace(/<[^>]*>/g,' ').split(/\s+/).length||0),0)};site.taxonomy=Object.fromEntries(['categories','tags','series'].map(domain=>[domain,collections[domain].map(e=>({id:e.id,title:e.title,url:domain==='series'?`/series/${e.id}/`:`/archive/?${domain==='categories'?'category':'tag'}=${encodeURIComponent(e.title)}`}))]));
site.progressIndicator={style:config.site.progressIndicator?.style || 'dual'};site.displaySettings=config.site.displaySettings;site.wallpaperMode=config.site.wallpaperMode.defaultMode;
site.bannerMobile='/'+config.site.banner.src.mobile[0].replace(/^\//,'');site.bannerOptions=config.site.banner;site.texture=config.site.texture;site.profileName=config.profile.name;site.profileLinks=config.profile.links;site.today=new Date().toISOString().slice(0,10);site.themeColor=config.site.themeColor;site.layout=config.postList.layout;
site.links=config.navBar.links.map(link=>({...link,label:link.pageKey||link.name.toLowerCase(),children:link.children?.map(child=>({...child,label:child.pageKey||child.name}))}));
for(const domain of ['categories','tags','series']){site.taxonomy[domain].sort((a,b)=>a.title.localeCompare(b.title,'en'));for(const e of site.taxonomy[domain])e.count=posts.filter(p=>domain==='tags'?p.tags.includes(e.title):domain==='categories'?p.category===e.title:p.series===e.id).length;}
site.stats.words=posts.filter(p=>!p.protected).reduce((n,p)=>n+(p.words||0),0);site.stats.moments=collections.moments.length;site.stats.categories=collections.categories.length;site.stats.tags=collections.tags.length;site.stats.series=collections.series.length;site.stats.days=Math.floor((Date.now()-Math.min(...posts.map(p=>new Date(p.published).getTime())))/86400000);site.stats.updated=posts.map(p=>p.published).sort().at(-1).slice(0,10);
site.pages=site.pages.filter(key=>config[key]?.enable!==false);site.links=site.links.filter(link=>link.children||link.external||link.url==='/'||site.pages.includes(link.url?.split('/')[1]));
if(config.music.enable&&config.sidebar.components.some(w=>w.type==='music'&&w.enable)){const tracks=config.music.provider==='custom'?config.music.tracks:rawData.music;if(tracks?.length)site.music={tracks,volume:config.music.defaultVolume};}
if(config.comment.enable&&config.comment.provider!=='none')site.comments=config.comment;if(config.umami.enable&&config.umami.websiteId&&config.umami.scriptUrl)site.analytics=config.umami;
await writeFile('.generated/public.json',JSON.stringify({site,posts,paths,collections:Object.fromEntries(Object.entries(collections).filter(([d])=>!['settings','posts'].includes(d))),spec}));
const adminCollections=structuredClone(collections); adminCollections.albums=adminCollections.albums.filter(e=>!e.data.protected); for(const list of Object.values(adminCollections)) for(const e of list) {delete e.html;delete e.toc;delete e.syntaxes;delete e.styles;delete e.minutes;delete e.words;}
await writeFile('.generated/admin.json',JSON.stringify({version:1,updatedAt:new Date().toISOString(),collections:adminCollections}));
const {index}=await createIndex();
for(const post of posts.filter(p=>!p.protected))await index.addHTMLFile({url:post.url,content:`<html lang="${site.lang}"><head><title>${post.title.replaceAll('<','&lt;')}</title></head><body><main data-pagefind-body><h1>${post.title.replaceAll('<','&lt;')}</h1>${post.html}</main></body></html>`});
await index.writeFiles({outputPath:'public/pagefind'});await index.deleteIndex();
const design=parse((await readFile('docs/design-reference.md','utf8')).split('---')[1]);
let tokens=':root{'+Object.entries(design.colors).map(([k,v])=>`--${k}:${v};`).join('')+'--font-sans:system-ui,sans-serif;--font-mono:ui-monospace,monospace;}';
await mkdir('.cache',{recursive:true});await build({tsconfigRaw:{compilerOptions:{target:'ESNext'}},entryPoints:['app/utils/mc-utils.ts'],outfile:'.cache/palette.mjs',bundle:true,platform:'node',format:'esm'});const {resolveScheme}=await import(pathToFileURL(resolve('.cache/palette.mjs')));
for(const dark of [false,true]){const scheme=resolveScheme(config.site.themeColor.hue,dark,config.site.themeColor.style,config.site.themeColor.spec);tokens+=(dark?':root.dark':':root')+'{'+Object.entries(scheme).filter(([,v])=>v).map(([key,value])=>{const name=key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());return `--${name}:${value};--mc-${name}:${value};`}).join('')+'}';}
await writeFile('app/assets/styles/palette.css',tokens);
console.log(`Compiled ${posts.length} posts; ${domains.length} admin domains; public index excludes protected posts.`);
