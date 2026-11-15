import {useEffect,useState} from 'react';
import {collection,getDocs,query,where,addDoc,updateDoc,doc,serverTimestamp} from 'firebase/firestore';
import {db,inp,btn,card} from '../db';

export default function Member({u}){
  const [tasks,setT]=useState([]);
  const [subs,setSubs]=useState([]);
  const [stats,setS]=useState([]);
  const [f,setF]=useState({});
  const [openHist,setOpenHist]=useState({});
  const [filter,setFilter]=useState('All');
  const [msg,setMsg]=useState('');

  const load=async()=>{
    setT((await getDocs(query(collection(db,'tasks'),where('memberId','==',u.uid)))).docs.map(d=>({id:d.id,...d.data()})).filter(t=>!t.archived));
    setSubs((await getDocs(query(collection(db,'submissions'),where('memberId','==',u.uid)))).docs.map(d=>({id:d.id,...d.data()})));
    setS((await getDocs(collection(db,'publicStats'))).docs.map(d=>({id:d.id,...d.data()})));
  };
  useEffect(()=>{load();},[]);

  const set=(id,k,v)=>setF({...f,[id]:{...f[id],[k]:v}});

  const handleImageUpload=(taskId,e)=>{
    const file=e.target.files?.[0];
    if(!file)return;

    const reader=new FileReader();
    reader.onload=(event)=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        const MAX_WIDTH=800;
        const scaleSize=MAX_WIDTH/img.width;
        canvas.width=MAX_WIDTH;
        canvas.height=img.height*scaleSize;

        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        
        const compressedBase64=canvas.toDataURL('image/jpeg',0.7);
        set(taskId,'ev',compressedBase64);
      };
      img.src=event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const send=async t=>{
    const x=f[t.id]||{};
    const p=Math.max(+x.p||0,t.reportedProgress);
    if(!x.work||p>100)return setMsg('Describe the work done and use progress 0–100.');
    if(x.blocked&&!x.prob?.trim())return setMsg('Please describe what is blocking you in the Problems field.');
    if(p===100&&!x.ev?.trim())return setMsg('Please upload an evidence screenshot before submitting at 100%.');

    await addDoc(collection(db,'submissions'),{
      memberId:u.uid,taskId:t.id,date:new Date().toISOString().slice(0,10),
      work:x.work,prev:t.reportedProgress,progress:p,
      evidence:x.ev||'',problems:x.prob||'',next:x.next||'',at:serverTimestamp()
    });
    await updateDoc(doc(db,'tasks',t.id),{
      reportedProgress:p,
      status:p===100?'Submitted for Review':x.blocked?'Blocked':'In Progress'
    });
    if(p===100)await addDoc(collection(db,'mailQueue'),{kind:'review',taskTitle:t.title,memberId:u.uid,status:'pending'});
    setF({...f,[t.id]:{}});
    setMsg(p===100?'Submitted for review.':'Update saved.');
    load();
  };

  const mine=stats.find(s=>s.id===u.uid);
  const active=tasks.filter(t=>!['Completed','Submitted for Review'].includes(t.status));
  const visible=active.filter(t=>filter==='All'||t.status===filter);

  const badgeColor=s=>s==='Blocked'?'text-red-400':s==='In Progress'?'text-amber-300':'text-slate-400';

  return <div className="space-y-5">
    <h1 className="text-xl font-semibold">Welcome, {mine?.name||u.email}</h1>
    <div className="grid grid-cols-3 gap-3">
      {[['Verified progress',(mine?.percent??0)+'%'],['Completed',tasks.filter(t=>t.status==='Completed').length],['Active',active.length]].map(([l,v])=>
        <div key={l} className={card}><p className="text-xs text-slate-400">{l}</p><p className="text-2xl font-bold text-cyan-300">{v}</p></div>
      )}
    </div>

    {msg&&<p className="text-amber-400 text-sm">{msg}</p>}

    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-medium">Active tasks ({visible.length})</h2>
      <div className="flex gap-1.5 text-xs">
        {['All','Not Started','In Progress','Blocked'].map(st=>
          <button key={st} onClick={()=>setFilter(st)} className={`px-2.5 py-1 rounded border ${filter===st?'bg-cyan-500/20 border-cyan-400 text-cyan-300':'border-white/10 text-slate-400 hover:text-white'}`}>{st}</button>
        )}
      </div>
    </div>

    {visible.map(t=>{
      const x=f[t.id]||{};
      const taskSubs=subs.filter(s=>s.taskId===t.id).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      return <div key={t.id} className={card+' space-y-2'}>
        <div className="flex items-start justify-between gap-3">
          <b>{t.title}</b>
          <span className="text-xs text-slate-400 shrink-0">
            <span className={badgeColor(t.status)}>{t.status}</span> · reported {t.reportedProgress}% · due {t.deadline||'—'}
          </span>
        </div>

        <div className="h-1.5 bg-white/10 rounded overflow-hidden">
          <div className="h-full bg-cyan-400 transition-all" style={{width:(t.reportedProgress||0)+'%'}}/>
        </div>

        {t.description&&<p className="text-sm text-slate-300">{t.description}</p>}
        {(t.evidence||t.criteria)&&<p className="text-xs text-slate-400">
          {t.evidence&&<>Required evidence: <span className="text-slate-300">{t.evidence}</span></>}
          {t.evidence&&t.criteria&&' · '}
          {t.criteria&&<>Acceptance criteria: <span className="text-slate-300">{t.criteria}</span></>}
        </p>}
        {t.status==='Rejected'&&<p className="text-xs text-red-400">Rejected: {t.rejectReason}</p>}

        <textarea className={inp} placeholder="Work completed today" value={x.work||''} onChange={e=>set(t.id,'work',e.target.value)}/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
          <input className={inp} type="number" min={t.reportedProgress} max="100" placeholder={`Progress % (min ${t.reportedProgress})`} value={x.p??''} onChange={e=>set(t.id,'p',e.target.value)}/>
          
          <div className="space-y-1">
            <input type="file" accept="image/*" className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer w-full" onChange={e=>handleImageUpload(t.id,e)}/>
            {x.ev&&<p className="text-[10px] text-green-400">✓ Screenshot attached</p>}
          </div>

          <input className={inp} placeholder="Problems / blockers" value={x.prob||''} onChange={e=>set(t.id,'prob',e.target.value)}/>
          <input className={inp} placeholder="Tomorrow's target" value={x.next||''} onChange={e=>set(t.id,'next',e.target.value)}/>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3">
            <label className="text-xs flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={!!x.blocked} onChange={e=>set(t.id,'blocked',e.target.checked)}/> I'm blocked
            </label>
            <button className={btn} onClick={()=>send(t)}>Submit update</button>
          </div>
          {taskSubs.length>0&&<button type="button" onClick={()=>setOpenHist({...openHist,[t.id]:!openHist[t.id]})} className="text-xs text-cyan-300 hover:underline">
            {openHist[t.id]?'Hide history':`Past updates (${taskSubs.length})`}
          </button>}
        </div>

        {openHist[t.id]&&<div className="mt-2 pt-2 border-t border-white/10 space-y-1.5 text-xs">
          {taskSubs.map(s=><div key={s.id} className="bg-white/5 rounded p-2 text-slate-300">
            <div className="flex justify-between text-slate-400">
              <span>{s.date}</span>
              <span>Progress: {s.prev}% → {s.progress}%</span>
            </div>
            <p className="mt-1">{s.work}</p>
            {s.evidence&&(s.evidence.startsWith('data:image')?<a href={s.evidence} target="_blank" rel="noreferrer"><img src={s.evidence} alt="Proof" className="h-16 rounded mt-1 border border-white/10 object-cover"/></a>:<a href={s.evidence} target="_blank" rel="noreferrer" className="text-cyan-300 underline block mt-0.5 truncate">Evidence link</a>)}
            {s.problems&&<p className="text-amber-300 mt-0.5">Blocker/Problem: {s.problems}</p>}
          </div>)}
        </div>}
      </div>;
    })}

    <h2 className="font-medium">Awaiting approval</h2>
    {tasks.filter(t=>t.status==='Submitted for Review').map(t=><div key={t.id} className={card}>{t.title}</div>)}

    <h2 className="font-medium">Completed history</h2>
    {tasks.filter(t=>t.status==='Completed').map(t=><div key={t.id} className={card+' text-green-400'}>✓ {t.title}</div>)}
  </div>;
}