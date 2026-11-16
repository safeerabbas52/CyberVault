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
  if(u===undefined)return <div className="min-h-screen grid place-items-center bg-[#060913] text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing CyberVault…</div>;
  if(!u)return <Login/>;
  const admin=u.email===ADMIN;
  
  const links=admin
    ?[['/admin','Command Center'],['/admin/members','Operatives'],['/admin/tasks','Operations'],['/admin/approvals','Verification'],['/admin/resources','Intel & Docs']]
    :[['/dashboard','My Console'],['/leaderboard','Team Leaderboard'],['/resources','Intel & Docs']];

  return <BrowserRouter>
    <div className="flex flex-col md:flex-row min-h-screen text-slate-200">
      {/* Glass Sidebar */}
      <aside className="md:w-64 p-5 border-b md:border-r border-white/[0.08] bg-[#090E1A]/80 backdrop-blur-2xl flex md:flex-col gap-2 justify-between md:justify-start">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
            <span className="font-bold tracking-wider text-white text-base">CYBER<span className="text-cyan-400">VAULT</span></span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-6 pl-5">
            {admin ? 'Admin Clearance' : 'Operative Node'}
          </p>

          <nav className="flex md:flex-col gap-1.5 flex-wrap">
            {links.map(([to,l])=>(
              <NavLink
                key={to}
                to={to}
                end
                className={({isActive})=>
                  `px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`
                }
              >
                <span>{l}</span>
                <span className="text-[10px] font-mono opacity-40">→</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="md:mt-auto pt-4 md:border-t border-white/[0.06] flex md:flex-col gap-2 items-center md:items-stretch">
          <div className="hidden md:block px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] font-mono text-slate-500 uppercase">Active Session</p>
            <p className="text-xs text-slate-300 truncate">{u.email}</p>
          </div>
          <button
            onClick={()=>signOut(auth)}
            className="px-3.5 py-2 rounded-xl text-left text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
        <Routes>
          {admin?<>
            <Route path="/admin" element={<AdminDash/>}/>
            <Route path="/admin/members" element={<Members/>}/>
            <Route path="/admin/tasks" element={<Tasks u={u}/>}/>
            <Route path="/admin/approvals" element={<Approvals u={u}/>}/>
            <Route path="/admin/resources" element={<Resources admin={true}/>}/>
          </>:<>
            <Route path="/dashboard" element={<Member u={u}/>}/>
            <Route path="/leaderboard" element={<Leaderboard/>}/>
            <Route path="/resources" element={<Resources admin={false}/>}/>
          </>}
          <Route path="*" element={<Navigate to={admin?'/admin':'/dashboard'}/>}/>
        </Routes>
      </main>
    </div>
  </BrowserRouter>;
}