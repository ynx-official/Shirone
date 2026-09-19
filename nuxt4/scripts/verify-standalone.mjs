import { cp, mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const directory = resolve('.cache/standalone');
await rm(directory, {recursive:true,force:true});
await mkdir(directory,{recursive:true});
await cp('.output', directory, {recursive:true,dereference:true});
const port = 43927;
const server = spawn(process.execPath, ['server/index.mjs'], {cwd:directory,env:{...process.env,NODE_ENV:'production',NITRO_HOST:'127.0.0.1',NITRO_PORT:String(port)},stdio:['ignore','pipe','pipe']});
let log='';server.stdout.on('data',data=>log+=data);server.stderr.on('data',data=>log+=data);
try {
 let ready=false;
 for(let i=0;i<100;i++) {try {ready=(await fetch(`http://127.0.0.1:${port}/api/health`)).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 assert(ready,log);
 for(const path of ['/','/posts/markdown/','/pagefind/pagefind.js','/rss.xml','/api/health']) {
 const response=await fetch(`http://127.0.0.1:${port}${path}`);assert.equal(response.status,200,path);
 }
 for(const path of ['/admin','/admin/preview','/api/mock/admin']) assert.equal((await fetch(`http://127.0.0.1:${port}${path}`)).status,404,path);
 console.log(`Standalone copied production artifact passes under ${process.version}`);
} finally {server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}
