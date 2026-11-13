import {useEffect,useState} from 'react';
import {initializeApp} from 'firebase/app';
import {getAuth,createUserWithEmailAndPassword,signOut} from 'firebase/auth';
import {collection,getDocs,setDoc,updateDoc,doc} from 'firebase/firestore';
import {db,cfg,DOMAINS,inp,btn,card,recompute,audit,auth} from '../db';
export default function Members(){
  const [list,setL]=useState([]);const [f,setF]=useState({name:'',email:'',pw:'',domain:DOMAINS[0]});const [msg,setM]=useState('');
  const load=async()=>setL((await getDocs(collection(db,'members'))).docs.map(d=>({id:d.id,...d.data()})));
  useEffect(()=>{load();},[]);
  const add=async e=>{e.preventDefault();setM('');
    try{const sec=getAuth(initializeApp(cfg,'sec'+Date.now()));  // secondary app keeps admin signed in
      const c=await createUserWithEmailAndPassword(sec,f.email,f.pw);await signOut(sec);
      await setDoc(doc(db,'members',c.user.uid),{name:f.name,email:f.email,domain:f.domain,active:true});
      await audit(auth.currentUser.email,'member.create',{email:f.email});await recompute();
      setF({name:'',email:'',pw:'',domain:DOMAINS[0]});setM('Member created.');load();}
    catch(x){setM(x.message);}};
  const upd=async(m,ch)=>{await updateDoc(doc(db,'members',m.id),ch);await audit(auth.currentUser.email,'member.update',{id:m.id,...ch});await recompute();load();};
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Members ({list.length}/7)</h1>
    <form onSubmit={add} className={card+' grid md:grid-cols-5 gap-2'}>
      <input className={inp} placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})} required/>
      <input className={inp} type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required/>
      <input className={inp} placeholder="Temp password (6+)" minLength={6} value={f.pw} onChange={e=>setF({...f,pw:e.target.value})} required/>
      <select className={inp} value={f.domain} onChange={e=>setF({...f,domain:e.target.value})}>{DOMAINS.map(d=><option key={d} className="text-black">{d}</option>)}</select>
      <button className={btn}>Add member</button>{msg&&<p className="text-xs text-amber-400 md:col-span-5">{msg}</p>}</form>
    <div className="space-y-2">{list.map(m=><div key={m.id} className={card+' flex flex-wrap gap-3 items-center justify-between'}>
      <div><b>{m.name}</b> <span className="text-xs text-slate-400">{m.email}</span></div>
      <select className={inp+' !w-auto'} value={m.domain} onChange={e=>upd(m,{domain:e.target.value})}>{DOMAINS.map(d=><option key={d} className="text-black">{d}</option>)}</select>
      <button className={btn} onClick={()=>upd(m,{active:!m.active})}>{m.active?'Deactivate':'Activate'}</button></div>)}</div></div>;
}
