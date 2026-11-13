import {useEffect,useState} from 'react';
import {collection,getDocs,query,where,addDoc,updateDoc,doc,serverTimestamp} from 'firebase/firestore';
import {db,inp,btn,card} from '../db';
export default function Member({u}){
  const [tasks,setT]=useState([]);const [stats,setS]=useState([]);const [f,setF]=useState({});const [msg,setMsg]=useState('');
  const load=async()=>{setT((await getDocs(query(collection(db,'tasks'),where('memberId','==',u.uid)))).docs.map(d=>({id:d.id,...d.data()})).filter(t=>!t.archived));
    setS((await getDocs(collection(db,'publicStats'))).docs.map(d=>({id:d.id,...d.data()})));};
  useEffect(()=>{load();},[]);
  const set=(id,k,v)=>setF({...f,[id]:{...f[id],[k]:v}});
  const send=async t=>{const x=f[t.id]||{};const p=Math.max(+x.p||0,t.reportedProgress);
    if(!x.work||p>100)return setMsg('Describe the work done and use progress 0–100.');
    await addDoc(collection(db,'submissions'),{memberId:u.uid,taskId:t.id,date:new Date().toISOString().slice(0,10),work:x.work,prev:t.reportedProgress,progress:p,evidence:x.ev||'',problems:x.prob||'',next:x.next||'',at:serverTimestamp()});
    await updateDoc(doc(db,'tasks',t.id),{reportedProgress:p,status:p===100?'Submitted for Review':x.blocked?'Blocked':'In Progress'});
    if(p===100)await addDoc(collection(db,'mailQueue'),{kind:'review',taskTitle:t.title,memberId:u.uid,status:'pending'});
    setF({...f,[t.id]:{}});setMsg(p===100?'Submitted for review.':'Update saved.');load();};
  const mine=stats.find(s=>s.id===u.uid);const team=stats.filter(s=>s.id!=='_overall');
  const active=tasks.filter(t=>!['Completed','Submitted for Review'].includes(t.status));
  return <div className="space-y-5"><h1 className="text-xl font-semibold">Welcome, {mine?.name||u.email}</h1>
    <div className="grid grid-cols-3 gap-3">{[['Verified progress',(mine?.percent??0)+'%'],['Completed',tasks.filter(t=>t.status==='Completed').length],['Active',active.length]].map(([l,v])=><div key={l} className={card}><p className="text-xs text-slate-400">{l}</p><p className="text-2xl font-bold text-cyan-300">{v}</p></div>)}</div>
    {msg&&<p className="text-amber-400 text-sm">{msg}</p>}
    <h2 className="font-medium">Active tasks</h2>
    {active.map(t=>{const x=f[t.id]||{};return <div key={t.id} className={card+' space-y-2'}>
      <div className="flex justify-between"><b>{t.title}</b><span className="text-xs text-slate-400">{t.status} · reported {t.reportedProgress}% · due {t.deadline||'—'}</span></div>
      {t.status==='Rejected'&&<p className="text-xs text-red-400">Rejected: {t.rejectReason}</p>}
      <textarea className={inp} placeholder="Work completed today" value={x.work||''} onChange={e=>set(t.id,'work',e.target.value)}/>
      <div className="grid md:grid-cols-4 gap-2">
        <input className={inp} type="number" min={t.reportedProgress} max="100" placeholder="Progress %" value={x.p??''} onChange={e=>set(t.id,'p',e.target.value)}/>
        <input className={inp} placeholder="Evidence URL" value={x.ev||''} onChange={e=>set(t.id,'ev',e.target.value)}/>
        <input className={inp} placeholder="Problems" value={x.prob||''} onChange={e=>set(t.id,'prob',e.target.value)}/>
        <input className={inp} placeholder="Tomorrow's target" value={x.next||''} onChange={e=>set(t.id,'next',e.target.value)}/></div>
      <label className="text-xs"><input type="checkbox" checked={!!x.blocked} onChange={e=>set(t.id,'blocked',e.target.checked)}/> I'm blocked</label>{' '}
      <button className={btn} onClick={()=>send(t)}>Submit update</button></div>;})}
    <h2 className="font-medium">Awaiting approval</h2>{tasks.filter(t=>t.status==='Submitted for Review').map(t=><div key={t.id} className={card}>{t.title}</div>)}
    <h2 className="font-medium">Completed history</h2>{tasks.filter(t=>t.status==='Completed').map(t=><div key={t.id} className={card+' text-green-400'}>✓ {t.title}</div>)}
    <h2 className="font-medium">Team progress (verified)</h2>
    <div className="grid md:grid-cols-2 gap-2">{team.map(s=><div key={s.id} className={card}><div className="flex justify-between text-sm"><span>{s.name} · {s.domain}</span><span>{s.percent}% ({s.done}/{s.total})</span></div><div className="h-2 bg-white/10 rounded mt-2"><div className="h-2 bg-cyan-400 rounded" style={{width:s.percent+'%'}}/></div></div>)}</div></div>;
}
