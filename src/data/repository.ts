import type {Store} from '../domain/model';
export const STORAGE_KEY='basabuddy:v1';
export const emptyStore=():Store=>({version:1,profiles:[],activeId:'',language:'fil',progress:{},assignments:[],quests:{}});
export interface ProgressRepository {load():Store;save(data:Store):void;clear():void}
// Replace this adapter with authenticated Supabase reads/writes; UI has no database dependency.
export class LocalRepository implements ProgressRepository {
 load():Store {const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return emptyStore();const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.profiles)||!d.progress||!Array.isArray(d.assignments)||!d.quests||!['fil','en'].includes(d.language)||d.profiles.some((p:any)=>typeof p.id!=='string'||typeof p.name!=='string')||Object.values(d.progress).some((p:any)=>!p.attempt||!Array.isArray(p.attempt.answers)||p.attempt.answers.length!==5||typeof p.best!=='number'))throw new Error('Saved data could not be read. Your original data has not been overwritten.');return d;}
 save(data:Store){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
 clear(){localStorage.removeItem(STORAGE_KEY);}
}
