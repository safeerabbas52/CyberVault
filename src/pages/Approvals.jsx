import {useEffect,useState} from 'react';
import {collection,getDocs,query,where,updateDoc,addDoc,doc,serverTimestamp} from 'firebase/firestore';
import {db,card,btn,recompute,audit} from '../db';
export default function Approvals({u}){
  const [tasks,setT]=useState([]);const [subs,setS]=useState([]);
  const load=async()=>{setT((await getDocs(query(collection(db,'tasks'),where('status','==','Submitted for Review')))).docs.map(d=>({id:d.id,...d.data()})));
    setS((await getDocs(collection(db,'submissions'))).docs.map(d=>d.data()));};
  useEffect(()=>{load();},[]);
  const decide=async(t,ok)=>{let reason='';if(!ok){reason=prompt('Rejection reason (required):')||'';if(!reason)return;}
    await updateDoc(doc(db,'tasks',t.id),ok?{status:'Completed',verifiedProgress:100}:{status:'Rejected',reportedProgress:99,rejectReason:reason});
    await addDoc(collection(db,'approvals'),{taskId:t.id,memberId:t.memberId,decision:ok?'approved':'rejected',reason,by:u.email,at:serverTimestamp()});
    await addDoc(collection(db,'mailQueue'),{kind:ok?'approved':'rejected',to:t.memberEmail,taskTitle:t.title,reason,status:'pending'});
    await audit(u.email,ok?'task.approve':'task.reject',{id:t.id,reason});await recompute();load();};
  return <div className="space-y-3"><h1 className="text-xl font-semibold">Pending approvals ({tasks.length})</h1>
    {tasks.map(t=>{const ev=subs.filter(s=>s.taskId===t.id).slice(-3);return <div key={t.id} className={card}>
      <b>{t.title}</b><p className="text-xs text-slate-400">Required evidence: {t.evidence||'—'} · Criteria: {t.criteria||'—'}</p>
      <ul className="text-sm my-2 list-disc ml-5">{ev.map((s,i)=><li key={i}>{s.date}: {s.work} {s.evidence&&<a className="text-cyan-400 underline" href={s.evidence} target="_blank" rel="noreferrer">evidence</a>}</li>)}</ul>
      <button className={btn} onClick={()=>decide(t,true)}>Approve</button> <button className="ml-2 text-red-400 text-sm" onClick={()=>decide(t,false)}>Reject</button></div>;})}
    {!tasks.length&&<p className="text-slate-400 text-sm">Nothing awaiting review.</p>}</div>;
}
