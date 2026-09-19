import { spawnSync } from 'node:child_process';
if(!process.version.startsWith('v24.'))throw Error('Run this validation with Node 24');
for(const args of [['scripts/build-content.mjs'], ['node_modules/nuxt/bin/nuxt.mjs','build'], ['scripts/verify-standalone.mjs']]) {
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env:{...process.env,NUXT_MOCK_ADMIN:'false',NODE_ENV:'production'}});
 if(result.status!==0)process.exit(result.status||1);
}
