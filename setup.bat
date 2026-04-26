@echo off
echo ========================================
echo    Jeff's Mission Control Setup
echo ========================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Creating folder...
if not exist "%USERPROFILE%\mission-control" mkdir "%USERPROFILE%\mission-control"
cd "%USERPROFILE%\mission-control"

echo [2/4] Installing Next.js...
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm --yes

echo [3/4] Creating Mission Control page...
powershell -Command "Set-Content -Path 'src\app\page.tsx' -Value @'
'use client';
import { useState, useEffect } from 'react';
export default function MissionControl() {
  const [todos, setTodos] = useState([{id:1,t:'Hino Phillips TSA card, find box routes until DAT performs again',done:false},{id:2,t:'Protean Earth: kids learn system, check Provo market if chosen',done:false},{id:3,t:'DL: 2 hours a week until June',done:false}]);
  const [revenue, setRevenue] = useState([{id:1,t:'Identify #1 growth opportunity',done:false},{id:2,t:'All DSPs need close knit group to risk or total value',done:false},{id:3,t:'Calculate current revenue run rate',done:false}]);
  const [notes, setNotes] = useState('');
  useEffect(() => { setTodos(JSON.parse(localStorage.getItem('mc_todos')||'[]')); setRevenue(JSON.parse(localStorage.getItem('mc_revenue')||'[]')); setNotes(localStorage.getItem('mc_notes')||''); }, []);
  const toggle = (id:number, type:string) => { const s = type==='t'?todos:revenue; const u = s.map(x=>x.id===id?{...x,done:!x.done}:x); type==='t'?setTodos(u):setRevenue(u); localStorage.setItem(type==='t'?'mc_todos':'mc_revenue',JSON.stringify(u)); };
  const addTodo = () => { const t = prompt('New task:'); if(t){const n=[...todos,{id:Date.now(),t,t:false}];setTodos(n);localStorage.setItem('mc_todos',JSON.stringify(n));} };
  return (
    <div style={{background:'#0a0a0a',color:'white',minHeight:'100vh',padding:'2rem',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'2rem',background:'linear-gradient(90deg,#f97316,#ef4444)','-webkitBackgroundClip':'text','-webkitTextFillColor':'transparent'}}>MISSION CONTROL</h1>
      <p style={{color:'#666'}}>Jeff's Command Center • {new Date().toLocaleDateString()}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',margin:'2rem 0'}}>
        <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222'}}><h3 style={{color:'#666',fontSize:'0.75rem'}}>Weather (South Jordan)</h3><p style={{fontSize:'1.5rem',color:'#f97316'}}>59°F ☀️</p><p style={{color:'#666',fontSize:'0.8rem'}}>Sunny</p></div>
        <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222'}}><h3 style={{color:'#666',fontSize:'0.75rem'}}>Revenue Goal</h3><p style={{fontSize:'1.5rem',color:'#22c55e'}}>$3M/yr</p><p style={{color:'#666',fontSize:'0.8rem'}}>Building...</p></div>
        <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222'}}><h3 style={{color:'#666',fontSize:'0.75rem'}}>Active Businesses</h3><p style={{fontSize:'1.5rem',color:'#3b82f6'}}>2</p><p style={{color:'#666',fontSize:'0.8rem'}}>Magnet Ref + Photo</p></div>
        <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222'}}><h3 style={{color:'#666',fontSize:'0.75rem'}}>Tasks Left</h3><p style={{fontSize:'1.5rem',color:'#a855f7'}}>{todos.filter(x=>!x.done).length}</p><p style={{color:'#666',fontSize:'0.8rem'}}>of {todos.length}</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222'}}><h2 style={{color:'#888',marginBottom:'1rem'}}>TODAY'S TASKS</h2>{todos.map(x=><label key={x.id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem',cursor:'pointer'}}><input type='checkbox' checked={x.done} onChange={()=>toggle(x.id,'t')} /><span style={{textDecoration:x.done?'line-through':'',color:x.done?'#444':'#ddd'}}>{x.t}</span></label>)}<button onClick={addTodo} style={{background:'#222',border:'1px dashed #444',color:'#888',padding:'0.5rem',borderRadius:'6px',cursor:'pointer',marginTop:'0.5rem'}}>+ Add Task</button></div>
        <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222'}}><h2 style={{color:'#888',marginBottom:'1rem'}}>REVENUE PATH</h2>{revenue.map(x=><label key={x.id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem',cursor:'pointer'}}><input type='checkbox' checked={x.done} onChange={()=>toggle(x.id,'r')} /><span style={{textDecoration:x.done?'line-through':'',color:x.done?'#444':'#ddd'}}>{x.t}</span></label>)}</div>
      </div>
      <div style={{background:'#111',padding:'1.5rem',borderRadius:'12px',border:'1px solid #222',marginTop:'1rem'}}><h2 style={{color:'#888',marginBottom:'1rem'}}>NOTES</h2><textarea value={notes} onChange={e=>{setNotes(e.target.value);localStorage.setItem('mc_notes',e.target.value)}} style={{width:'100%',background:'#0a0a0a',border:'1px solid #222',borderRadius:'8px',color:'#ccc',padding:'0.75rem',minHeight:'100px',fontFamily:'monospace'}}/></div>
    </div>
  );
}
'@"

echo [4/4] Starting server...
echo.
echo ========================================
echo    DONE! Opening Mission Control...
echo ========================================
start http://localhost:3000
npm run dev