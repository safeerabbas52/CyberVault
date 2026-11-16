import {useEffect,useRef,useState} from 'react';
import {BrowserRouter,Routes,Route,Navigate,NavLink} from 'react-router-dom';
import {onAuthStateChanged,signOut} from 'firebase/auth';
import {collection,query,where,onSnapshot} from 'firebase/firestore';
import {auth,ADMIN,db} from './db';
import Login from './pages/Login';
import AdminDash from './pages/AdminDash';
import Members from './pages/Members';
import Tasks from './pages/Tasks';
import Approvals from './pages/Approvals';
import Member from './pages/Member';
import Leaderboard from './pages/Leaderboard';
import Resources from './pages/Resources';

function LiveCyberCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 1.8 + 1.2,
    }));
    const draw = () => {
      ctx.fillStyle = '#04060E';
      ctx.fillRect(0, 0, w, h);
      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, w * 0.5);
      g1.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.85)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 160) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.35 * (1 - dist / 160)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
}

export default function App(){
  const [u,setU]=useState(undefined);
  const [pendingCount,setPendingCount]=useState(0);

  useEffect(()=>onAuthStateChanged(auth,setU),[]);

  // Real-time listener for pending approvals
  useEffect(()=>{
    if(!u || u.email !== ADMIN) return;
    const q = query(collection(db, 'tasks'), where('status', '==', 'Submitted for Review'));
    const unsubscribe = onSnapshot(q, (snapshot)=>{
      setPendingCount(snapshot.docs.length);
    });
    return ()=>unsubscribe();
  },[u]);

  if(u===undefined)return <div className="min-h-screen grid place-items-center bg-[#04060E] text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing CyberVault…</div>;
  if(!u)return <><LiveCyberCanvas/><div style={{position:'relative',zIndex:10}}><Login/></div></>;
  const admin=u.email===ADMIN;
  
  const links=admin
    ?[['/admin','Command Center'],['/admin/members','Operatives'],['/admin/tasks','Operations'],['/admin/approvals','Verification', pendingCount],['/admin/resources','Intel & Docs']]
    :[['/dashboard','My Console'],['/leaderboard','Team Leaderboard'],['/resources','Intel & Docs']];

  return <BrowserRouter>
    <LiveCyberCanvas />
    <div style={{ position: 'relative', zIndex: 10 }} className="flex flex-col md:flex-row min-h-screen text-slate-200">
      <aside className="md:w-64 p-5 border-b md:border-r border-white/[0.08] bg-[#090E1A]/70 backdrop-blur-xl flex md:flex-col gap-2 justify-between md:justify-start">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
            <span className="font-bold tracking-wider text-white text-base">CYBER<span className="text-cyan-400">VAULT</span></span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-6 pl-5">
            {admin ? 'Admin Clearance' : 'Operative Node'}
          </p>

          <nav className="flex md:flex-col gap-1.5 flex-wrap">
            {links.map(([to, l, badge])=>(
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
                <div className="flex items-center gap-2">
                  {badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full animate-pulse">
                      {badge}
                    </span>
                  )}
                  <span className="text-[10px] font-mono opacity-40">→</span>
                </div>
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