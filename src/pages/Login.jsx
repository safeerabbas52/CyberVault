import {useState} from 'react';
import {signInWithEmailAndPassword,sendPasswordResetEmail,setPersistence,browserLocalPersistence,browserSessionPersistence} from 'firebase/auth';
import {auth,inp,btn} from '../db';
export default function Login(){
  const [e,setE]=useState('');const [p,setP]=useState('');const [show,setShow]=useState(false);const [rem,setRem]=useState(true);
  const [err,setErr]=useState('');const [busy,setBusy]=useState(false);
  const go=async ev=>{ev.preventDefault();setBusy(true);setErr('');
    try{await setPersistence(auth,rem?browserLocalPersistence:browserSessionPersistence);await signInWithEmailAndPassword(auth,e,p);}
    catch{setErr('Invalid email or password.');}setBusy(false);};
  const reset=async()=>{if(!e)return setErr('Enter your email first.');try{await sendPasswordResetEmail(auth,e);setErr('Reset email sent.');}catch{setErr('Could not send reset email.');}};
  return <div className="min-h-screen grid place-items-center bg-[#090D16] text-slate-200 p-4">
    <form onSubmit={go} className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3 backdrop-blur">
      <h1 className="text-2xl font-bold text-cyan-400">CyberVault Progress Tracker</h1><p className="text-sm text-slate-400">Team Progress Management</p>
      <input className={inp} type="email" placeholder="Email" value={e} onChange={x=>setE(x.target.value)} required/>
      <input className={inp} type={show?'text':'password'} placeholder="Password" value={p} onChange={x=>setP(x.target.value)} required/>
      <div className="flex justify-between text-xs text-slate-400">
        <label><input type="checkbox" checked={show} onChange={()=>setShow(!show)}/> Show password</label>
        <label><input type="checkbox" checked={rem} onChange={()=>setRem(!rem)}/> Remember me</label></div>
      {err&&<p className="text-xs text-amber-400">{err}</p>}
      <button className={btn+' w-full'} disabled={busy}>{busy?'Signing in…':'Sign in'}</button>
      <button type="button" onClick={reset} className="text-xs text-slate-400 underline">Forgot password?</button>
    </form></div>;
}
