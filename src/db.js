import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore,collection,getDocs,setDoc,doc,addDoc,serverTimestamp} from 'firebase/firestore';
const e=import.meta.env;
export const cfg={apiKey:e.VITE_API_KEY,authDomain:e.VITE_AUTH_DOMAIN,projectId:e.VITE_PROJECT_ID,appId:e.VITE_APP_ID};
export const app=initializeApp(cfg);
export const auth=getAuth(app);
export const db=getFirestore(app);
export const ADMIN=e.VITE_ADMIN_EMAIL;
export const DOMAINS=['Web Exploitation','Reverse Engineering','Binary Exploitation','Digital Forensics','Cryptography'];
export const STATUSES=['Not Started','In Progress','Submitted for Review','Completed','Rejected','Blocked'];
export const inp='w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-400';
export const btn='rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-3 py-2 text-sm';
export const card='rounded-xl bg-white/5 border border-white/10 p-4';
// Weighted progress from APPROVED (Completed) tasks only. Zero tasks => 0.
export const pct=(tasks)=>{const a=tasks.filter(t=>!t.archived);const w=a.reduce((s,t)=>s+(+t.weight||1),0);
  const d=a.filter(t=>t.status==='Completed').reduce((s,t)=>s+(+t.weight||1),0);return w?Math.round(d/w*1000)/10:0;};
export const audit=(who,action,data)=>addDoc(collection(db,'auditLogs'),{who,action,data,at:serverTimestamp()});
// Admin-only: rebuild the member-visible stats documents.
export async function recompute(){
  const [t,m]=await Promise.all([getDocs(collection(db,'tasks')),getDocs(collection(db,'members'))]);
  const tasks=t.docs.map(d=>({id:d.id,...d.data()}));
  await Promise.all(m.docs.map(x=>{const mine=tasks.filter(k=>k.memberId===x.id&&!k.archived);
    return setDoc(doc(db,'publicStats',x.id),{name:x.data().name,domain:x.data().domain,percent:pct(mine),total:mine.length,done:mine.filter(k=>k.status==='Completed').length});}));
  const all=tasks.filter(k=>!k.archived);
  await setDoc(doc(db,'publicStats','_overall'),{percent:pct(all),total:all.length,done:all.filter(k=>k.status==='Completed').length});
}
