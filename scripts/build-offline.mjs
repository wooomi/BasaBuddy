// Cache only the static production build, never recordings made by learners or APIs.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const root=process.argv[2]?pathToFileURL(resolve(process.argv[2])+'/'):new URL('../dist/',import.meta.url);
async function walk(path=''){
 const entries=await readdir(new URL(path,root),{withFileTypes:true});
 const groups=await Promise.all(entries.map(entry=>entry.isDirectory()?walk(path+entry.name+'/'):[path+entry.name]));
 return groups.flat().filter(path=>path!=='sw.js');
}
const files=await walk();const hash=createHash('sha256');
for(const file of files){hash.update(file);hash.update(await readFile(new URL(file,root)));}
const cache='basabuddy-static-'+hash.digest('hex').slice(0,16);
const code=`const CACHE=${JSON.stringify(cache)};
const FILES=${JSON.stringify(files.map(file=>'/'+file))};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('basabuddy-static-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode!=='navigate'&&!FILES.includes(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request.mode==='navigate'?'/index.html':url.pathname);
  if(!cached)return fetch(request);
  const range=request.headers.get('range');
  if(range&&url.pathname.startsWith('/audio/')){
   const bytes=await cached.arrayBuffer(),match=/^bytes=(\\d*)-(\\d*)$/.exec(range);
   if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});
   const start=match[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match[2]));
   const end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;
   if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});
   return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':cached.headers.get('Content-Type')||'audio/mpeg','Accept-Ranges':'bytes','Content-Range':'bytes '+start+'-'+end+'/'+bytes.byteLength,'Content-Length':String(end-start+1)}});
  }
  return cached;
 })());
});
`;
await writeFile(new URL('sw.js',root),code);
console.log(`Offline build: ${files.length} static files (${files.filter(x=>x.startsWith('audio/')).length} audio files).`);
