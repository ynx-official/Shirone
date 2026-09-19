// Explicit one-time migration tool. Never invoked by dev/build/runtime.
import { build } from 'esbuild';
import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve('..');
await mkdir('.cache', {recursive:true});
const configurations={};
for(const name of (await readdir(`${root}/src/config`)).filter(x=>x.endsWith('Config.ts') && x!=='integrationsConfig.ts')) {
 try {
  const output=resolve(`.cache/${name}.mjs`);
  await build({entryPoints:[`${root}/src/config/${name}`],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external',alias:{'@':`${root}/src`,'@i18n':`${root}/src/i18n`,'@utils':`${root}/src/utils`},plugins:[{name:'snapshot-defaults',setup(b){b.onLoad({filter:/config-overlay\.ts$/},()=>({contents:'export const withUserConfig = (_, defaults) => defaults; export const getUserConfig = () => undefined;',loader:'ts'}))}}],logLevel:'silent'});
  const exports=await import(output); const key=Object.keys(exports).find(x=>x===name.replace('.ts','')); if(key) configurations[key.replace('Config','')]=exports[key];
 } catch(e){console.error(name,e.message)}
}
for(const key of ['comment','umami','music']) if(configurations[key]) configurations[key].enable=false;
await writeFile('mock/public/config.json',JSON.stringify(configurations,null,2));
const data={};
for(const name of await readdir('mock/source-data')) {
 if(!name.endsWith('.ts'))continue;
 const output=resolve(`.cache/data-${name}.mjs`);
 await build({entryPoints:[`mock/source-data/${name}`],outfile:output,bundle:true,platform:'node',format:'esm',logLevel:'silent'});
 const exports=await import(output); data[name.replace('.ts','')]=Object.values(exports).find(Array.isArray)||[];
}
await writeFile('mock/public/data.json',JSON.stringify(data,null,2));
