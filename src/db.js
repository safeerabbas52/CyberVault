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
export const inp = "w-full rounded-xl bg-[#060913]/90 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all";
export const btn = "rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer";
export const card = "relative rounded-2xl bg-[#0B1120]/80 backdrop-blur-xl border border-white/[0.08] border-t-white/[0.15] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-cyan-500/30";// Weighted progress from APPROVED (Completed) tasks only. Zero tasks => 0.
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
