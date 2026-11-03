import {test,expect} from '@playwright/test';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';

test('production worker caches audio for offline reload, decoding and range requests',async({page,context})=>{
 // Silence is a transport/decoder fixture, never a lesson recording.
 const root=await mkdtemp(join(tmpdir(),'basabuddy-offline-'));
 await mkdir(join(root,'audio'));
 const wav=Buffer.alloc(44+16000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
 await writeFile(join(root,'audio/test.wav'),wav);
 await writeFile(join(root,'index.html'),`<!doctype html><title>Offline test fixture</title><button onclick="document.querySelector('audio').play().then(()=>document.querySelector('output').textContent='playing')">Play</button><output></output><audio src="/audio/test.wav"></audio><script>navigator.serviceWorker.register('/sw.js')</script>`);
 execFileSync(process.execPath,['scripts/build-offline.mjs',root]);
 const server=createServer(async(req,res)=>{try{const path=new URL(req.url!,'http://localhost').pathname;const file=path==='/'?'/index.html':path;res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.wav')?'audio/wav':'text/html');res.end(await readFile(join(root,file)));}catch{res.statusCode=404;res.end();}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address() as {port:number};
 try{
  await page.goto(`http://127.0.0.1:${address.port}/`);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);await page.reload();
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await expect(page.locator('output')).toHaveText('playing');
  expect(await page.locator('audio').evaluate((a:HTMLAudioElement)=>a.duration)).toBe(1);
  expect(await page.evaluate(async()=>{const r=await fetch('/audio/test.wav',{headers:{Range:'bytes=12-31'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength,range:r.headers.get('content-range')};})).toEqual({status:206,size:20,range:'bytes 12-31/16044'});
  expect(await page.evaluate(async()=> (await fetch('/audio/test.wav',{headers:{Range:'bytes=99999-'}})).status)).toBe(416);
 }finally{await context.setOffline(false);await new Promise<void>(resolve=>server.close(()=>resolve()));await rm(root,{recursive:true,force:true});}
});
