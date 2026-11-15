import {useEffect,useState} from 'react';
import {BrowserRouter,Routes,Route,Navigate,NavLink} from 'react-router-dom';
import {onAuthStateChanged,signOut} from 'firebase/auth';
import {auth,ADMIN} from './db';
import Login from './pages/Login';
import AdminDash from './pages/AdminDash';
import Members from './pages/Members';
import Tasks from './pages/Tasks';
import Approvals from './pages/Approvals';
import Member from './pages/Member';
import Leaderboard from './pages/Leaderboard';
import Resources from './pages/Resources';

export default function App(){
  const [u,setU]=useState(undefined);
  useEffect(()=>onAuthStateChanged(auth,setU),[]);
  if(u===undefined)return <p className="p-8 text-slate-300 bg-[#090D16] min-h-screen">Loading…</p>;
  if(!u)return <Login/>;
  const admin=u.email===ADMIN;
  
  const links=admin
    ?[['/admin','Dashboard'],['/admin/members','Members'],['/admin/tasks','Tasks'],['/admin/approvals','Approvals']]
    :[['/dashboard','My Dashboard'],['/leaderboard','Team Leaderboard'],['/resources','Resources & Docs']];

  return <BrowserRouter><div className="flex flex-col md:flex-row min-h-screen bg-[#090D16] text-slate-200">
    <aside className="md:w-56 p-4 border-b md:border-r border-white/10 flex md:flex-col gap-2 flex-wrap">
      <b className="text-cyan-400 text-lg mb-2">CyberVault Progress Tracker</b>
      {links.map(([to,l])=><NavLink key={to} to={to} end className={({isActive})=>'px-3 py-2 rounded-lg text-sm '+(isActive?'bg-cyan-500/20 text-cyan-300':'hover:bg-white/5')}>{l}</NavLink>)}
      <button onClick={()=>signOut(auth)} className="px-3 py-2 text-left text-sm text-slate-400 md:mt-auto">Sign out</button>
    </aside>
    <main className="flex-1 p-4 md:p-6 overflow-x-auto"><Routes>
      {admin?<>
        <Route path="/admin" element={<AdminDash/>}/><Route path="/admin/members" element={<Members/>}/>
        <Route path="/admin/tasks" element={<Tasks u={u}/>}/><Route path="/admin/approvals" element={<Approvals u={u}/>}/>
      </>:<>
        <Route path="/dashboard" element={<Member u={u}/>}/>
        <Route path="/leaderboard" element={<Leaderboard/>}/>
        <Route path="/resources" element={<Resources/>}/>
      </>}
      <Route path="*" element={<Navigate to={admin?'/admin':'/dashboard'}/>}/>
    </Routes></main></div></BrowserRouter>;
}