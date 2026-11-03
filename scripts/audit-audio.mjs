// Read-only local validation. No network, speech service or lesson-text upload.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {lessonBank,dictionary} from '../src/content/lessons.ts';
const manifest=JSON.parse(await readFile(new URL('../src/audio/manifest.json',import.meta.url)));
const practice={fil:['mansanas','Ang pusa ay maliit.','pusa','aso','ibon','ba ta','Si Ana ay may pusa. Mabait ang pusa ni Ana. Masaya silang maglaro.'],en:['apple','The cat is little.','cat','dog','bird','c a t','Ana has a cat. Her cat is kind. They are happy when they play together.']};
const checklist={};const errors=[];
for(const lang of ['fil','en']){
 const texts=new Set(practice[lang]);
 for(const lesson of lessonBank[lang]){
  texts.add(lesson.model);if(lesson.passage)texts.add(lesson.passage);
  for(const item of lesson.questions){texts.add(item.answer);if(item.audio)texts.add(item.audio);}
 }
 dictionary.forEach(item=>texts.add(item[lang==='fil'?1:2]));
 checklist[lang]=[...texts].map(text=>({text,path:manifest[lang][text]??`/audio/${lang}-${createHash('sha256').update(text).digest('hex').slice(0,16)}.mp3`,bundled:!!manifest[lang][text]}));
 for(const [text,path] of Object.entries(manifest[lang])){
  if(!/^\/audio\/[a-zA-Z0-9_-]+\.(mp3|wav|ogg|m4a)$/.test(path)){errors.push(`${lang}: invalid local path for ${JSON.stringify(text)}`);continue;}
  try{
   const data=await readFile(new URL('../public'+path,import.meta.url));
   const valid=data.length>44&&(data.toString('ascii',0,3)==='ID3'||(data[0]===255&&(data[1]&224)===224)||data.toString('ascii',0,4)==='OggS'||(data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WAVE')||data.toString('ascii',4,8)==='ftyp');
   if(!valid)errors.push(`${path}: not a recognized audio file`);
  }catch{errors.push(`${path}: missing/unreadable file`);}
 }
 console.log(`${lang}: ${checklist[lang].filter(x=>x.bundled).length}/${texts.size} narration texts bundled.`);
}
if(process.argv.includes('--write-checklist'))await writeFile(new URL('../docs/audio-recording-checklist.json',import.meta.url),JSON.stringify(checklist,null,2)+'\n');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
if(process.argv.includes('--require-complete')&&Object.values(checklist).flat().some(x=>!x.bundled)){console.error('Narration is incomplete. Supply recordings listed in docs/audio-recording-checklist.json.');process.exitCode=1;}
