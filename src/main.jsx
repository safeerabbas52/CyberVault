import React from 'react';import {createRoot} from 'react-dom/client';import './index.css';
const e=import.meta.env;const missing=['VITE_API_KEY','VITE_AUTH_DOMAIN','VITE_PROJECT_ID','VITE_APP_ID','VITE_ADMIN_EMAIL'].filter(k=>!e[k]);
const root=createRoot(document.getElementById('root'));
const Msg=({title,children})=><div style={{minHeight:'100vh',background:'#090D16',color:'#e2e8f0',padding:32,fontFamily:'sans-serif'}}><h2 style={{color:'#22d3ee'}}>{title}</h2>{children}</div>;
class Boundary extends React.Component{state={err:null};static getDerivedStateFromError(err){return {err};}
  render(){return this.state.err?<Msg title="Something went wrong"><pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.err)}</pre></Msg>:this.props.children;}}
if(missing.length){
  root.render(<Msg title="CyberVault is not configured"><p>Missing settings: <b>{missing.join(', ')}</b></p>
    <p>Create a file named <code>.env</code> in the project root (copy <code>.env.example</code>), fill in your Firebase values, then stop and restart <code>npm run dev</code>.</p></Msg>);
}else{
  import('./App').then(m=>{const App=m.default;root.render(<Boundary><App/></Boundary>);})
    .catch(err=>root.render(<Msg title="Failed to start"><pre style={{whiteSpace:'pre-wrap'}}>{String(err)}</pre></Msg>));
}
