import {useEffect,useState} from 'react';
import {collection,getDocs} from 'firebase/firestore';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {db,pct,card,btn,recompute} from '../db';
export default function AdminDash(){
  const [tasks,setT]=useState([]);const [stats,setS]=useState([]);
  const load=async()=>{setT((await getDocs(collection(db,'tasks'))).docs.map(d=>d.data()).filter(t=>!t.archived));
    setS((await getDocs(collection(db,'publicStats'))).docs.map(d=>({id:d.id,...d.data()})).filter(s=>s.id!=='_overall'));};
  useEffect(()=>{load();},[]);
  const c=s=>tasks.filter(t=>t.status===s).length;const overall=pct(tasks);
  const cards=[['Tasks',tasks.length],['Completed',c('Completed')],['Awaiting approval',c('Submitted for Review')],['Blocked',c('Blocked')],['Pending',tasks.length-c('Completed')],['Overall (verified)',overall+'%']];
  return <div className="space-y-6"><div className="flex justify-between"><h1 className="text-xl font-semibold">Admin Dashboard</h1>
    <button className={btn} onClick={async()=>{await recompute();load();}}>Refresh stats</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">{cards.map(([l,v])=><div key={l} className={card}><p className="text-xs text-slate-400">{l}</p><p className="text-2xl font-bold text-cyan-300">{v}</p></div>)}</div>
    <div className="grid lg:grid-cols-2 gap-4">
      <div className={card+' h-64'}><p className="text-sm mb-2">Verified progress by member (%)</p><ResponsiveContainer><BarChart data={stats}><XAxis dataKey="name" stroke="#94a3b8" fontSize={11}/><YAxis domain={[0,100]} stroke="#94a3b8"/><Tooltip/><Bar dataKey="percent" fill="#22d3ee"/></BarChart></ResponsiveContainer></div>
      <div className={card+' h-64'}><p className="text-sm mb-2">Overall completion</p><ResponsiveContainer><PieChart><Pie data={[{n:'Done',v:overall},{n:'Left',v:100-overall}]} dataKey="v" innerRadius={50} outerRadius={80}><Cell fill="#22d3ee"/><Cell fill="#1e293b"/></Pie><Tooltip/></PieChart></ResponsiveContainer></div></div>
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">{stats.map(s=><div key={s.id} className={card}><b>{s.name}</b><p className="text-xs text-slate-400">{s.domain}</p><p className="mt-1">{s.percent}% · {s.done}/{s.total} tasks</p></div>)}</div></div>;
}
