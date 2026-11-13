import {useEffect,useState} from 'react';
import {collection,getDocs,addDoc,updateDoc,deleteDoc,doc,serverTimestamp} from 'firebase/firestore';
import {db,inp,btn,card,STATUSES,recompute,audit} from '../db';
const blank={title:'',description:'',memberId:'',priority:'Medium',deadline:'',weight:1,criteria:'',evidence:''};
export default function Tasks({u}){
  const [tasks,setT]=useState([]);const [mem,setM]=useState([]);const [f,setF]=useState(blank);
  const load=async()=>{setT((await getDocs(collection(db,'tasks'))).docs.map(d=>({id:d.id,...d.data()})));setM((await getDocs(collection(db,'members'))).docs.map(d=>({id:d.id,...d.data()})));};
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();const m=mem.find(x=>x.id===f.memberId);if(!m)return;
    const r=await addDoc(collection(db,'tasks'),{...f,weight:+f.weight||1,memberEmail:m.email,domain:m.domain,status:'Not Started',reportedProgress:0,verifiedProgress:0,archived:false,subtasks:[],createdAt:serverTimestamp()});
    await audit(u.email,'task.create',{id:r.id});await recompute();setF(blank);load();};
  const upd=async(t,ch)=>{await updateDoc(doc(db,'tasks',t.id),ch);await audit(u.email,'task.update',{id:t.id,...ch});await recompute();load();};
  const del=async t=>{if(!confirm('Delete task?'))return;await deleteDoc(doc(db,'tasks',t.id));await audit(u.email,'task.delete',{id:t.id,title:t.title});await recompute();load();};
  const name=id=>mem.find(m=>m.id===id)?.name||'?';
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Tasks ({tasks.length})</h1>
    <form onSubmit={add} className={card+' grid md:grid-cols-4 gap-2'}>
      <input className={inp+' md:col-span-2'} placeholder="Title" value={f.title} onChange={e=>setF({...f,title:e.target.value})} required/>
      <select className={inp} value={f.memberId} onChange={e=>setF({...f,memberId:e.target.value})} required><option value="" className="text-black">Assign to…</option>{mem.map(m=><option key={m.id} value={m.id} className="text-black">{m.name}</option>)}</select>
      <select className={inp} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}>{['Low','Medium','High'].map(p=><option key={p} className="text-black">{p}</option>)}</select>
      <input className={inp} type="date" value={f.deadline} onChange={e=>setF({...f,deadline:e.target.value})}/>
      <input className={inp} type="number" min="1" placeholder="Weight" value={f.weight} onChange={e=>setF({...f,weight:e.target.value})}/>
      <input className={inp} placeholder="Required evidence" value={f.evidence} onChange={e=>setF({...f,evidence:e.target.value})}/>
      <input className={inp} placeholder="Acceptance criteria" value={f.criteria} onChange={e=>setF({...f,criteria:e.target.value})}/>
      <textarea className={inp+' md:col-span-3'} placeholder="Description" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/><button className={btn}>Create task</button></form>
    <div className="space-y-2">{tasks.map(t=><div key={t.id} className={card+' flex flex-wrap gap-2 items-center justify-between'}>
      <div><b>{t.title}</b><p className="text-xs text-slate-400">{name(t.memberId)} · {t.priority} · w{t.weight} · due {t.deadline||'—'} · reported {t.reportedProgress}%</p></div>
      <select className={inp+' !w-auto'} value={t.status} onChange={e=>upd(t,{status:e.target.value,verifiedProgress:e.target.value==='Completed'?100:t.verifiedProgress})}>{STATUSES.map(s=><option key={s} className="text-black">{s}</option>)}</select>
      <input className={inp+' !w-20'} type="number" min="0" max="100" defaultValue={t.reportedProgress} onBlur={e=>+e.target.value!==t.reportedProgress&&upd(t,{reportedProgress:+e.target.value})} title="Admin correction of reported %"/>
      <button className={btn} onClick={()=>upd(t,{archived:!t.archived})}>{t.archived?'Unarchive':'Archive'}</button>
      <button className="text-red-400 text-sm" onClick={()=>del(t)}>Delete</button></div>)}</div></div>;
}
