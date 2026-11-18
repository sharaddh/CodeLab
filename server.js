const express=require('express');
const path=require('path');
const fs=require('fs');
const os=require('os');
const {execFile}=require('child_process');
const util=require('util');
const execFileP=util.promisify(execFile);

const app=express();
app.use(express.json({limit:'4mb'}));
app.use(express.static(path.join(__dirname,'public')));

const DATA_DIR=path.join(__dirname,'data');
function loadData(name){
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR,name),'utf8'));
}
let problems=loadData('problems.json');
let details=loadData('details.json');
let companies=loadData('companies.json');
let solutions=loadData('solutions.json');
const solutionsBySlug={};
for(const s of solutions)solutionsBySlug[s.slug]=s;
const companySet=new Set(companies.map(c=>c.name.toLowerCase()));
const topicSet=new Set();
for(const p of problems)for(const t of (p.topics||[]))topicSet.add(String(t.name||t));
console.log('Loaded',problems.length,'problems ·',Object.keys(details).length,'details ·',solutions.length,'curated solutions ·',companies.length,'companies ·',Object.keys(solutionsBySlug).length,'solution slugs');

app.get('/api/problems',(req,res)=>{
  const q=(req.query.q||'').toLowerCase();
  const difficulty=req.query.difficulty||'all';
  const topic=req.query.topic||'all';
  const company=req.query.company||'all';
  const premium=req.query.premium||'all';
  const max=Math.min(Number(req.query.max||4000)||4000,problems.length);
  let list=problems;
  if(difficulty!=='all')list=list.filter(p=>p.difficulty===difficulty);
  if(topic!=='all')list=list.filter(p=>(p.topics||[]).some(x=>String(x.name||x)===topic));
  if(company!=='all')list=list.filter(p=>(p.companies||[]).some(c=>c.name.toLowerCase()===company.toLowerCase()));
  if(premium==='true')list=list.filter(p=>p.paidOnly);
  if(premium==='false')list=list.filter(p=>!p.paidOnly);
  if(q){
    list=list.filter(p=>`${p.id} ${p.title} ${(p.topics||[]).map(x=>x.name||x).join(' ')} ${(p.companies||[]).map(c=>c.name).join(' ')}`.toLowerCase().includes(q));
  }
  const sort=req.query.sort||'id';
  if(sort==='freq')list=[...list].sort((a,b)=>(b.askedBy-a.askedBy)||(b.frequency-a.frequency)||(Number(a.id)-Number(b.id)));
  else list=[...list].sort((a,b)=>Number(a.id)-Number(b.id));
  res.json({total:list.length,problems:list.slice(0,max)});
});

app.get('/api/problem/:slug',(req,res)=>{
  const p=problems.find(x=>x.slug===req.params.slug);
  if(!p)return res.status(404).json({error:'Problem not found'});
  const d=details[req.params.slug]||{};
  res.json({...p,...d,solution:solutionsBySlug[req.params.slug]||null});
});

app.get('/api/companies',(req,res)=>{
  const q=(req.query.q||'').toLowerCase();
  const list=companies.filter(c=>!q||c.name.toLowerCase().includes(q));
  res.json(list);
});

app.get('/api/topics',(req,res)=>{
  res.json([...topicSet].sort());
});

app.get('/api/solutions',(req,res)=>{
  res.json({count:solutions.length,solutions});
});

app.get('/api/stats',(req,res)=>{
  const c={Easy:0,Medium:0,Hard:0};
  let premium=0;
  for(const p of problems){c[p.difficulty]=(c[p.difficulty]||0)+1;if(p.paidOnly)premium++;}
  const withCompany=problems.filter(p=>(p.companies||[]).length).length;
  const withSolution=Object.keys(details).filter(s=>details[s].solutionsMarkdown).length;
  res.json({total:problems.length,easy:c.Easy,medium:c.Medium,hard:c.Hard,premium,withCompany,editorialSolutions:withSolution,curatedSolutions:solutions.length,companies:companies.length});
});

function tmpDir(){return fs.mkdtempSync(path.join(os.tmpdir(),'lc-lab-'))}

app.post('/api/compile',async(req,res)=>{
  const {language,code}=req.body||{};
  if(!code)return res.status(400).json({ok:false,error:'No code'});
  const dir=tmpDir();
  try{
    if(language==='python'){
      const f=path.join(dir,'main.py');fs.writeFileSync(f,code);
      await execFileP('python',['-m','py_compile',f],{timeout:8000});
      return res.json({ok:true,message:'Python syntax/compile check passed.'});
    }
    if(language==='java'){
      const f=path.join(dir,'Solution.java');fs.writeFileSync(f,code);
      await execFileP('javac',['-encoding','UTF-8',f],{timeout:10000});
      return res.json({ok:true,message:'Java compilation passed.'});
    }
    if(language==='cpp'){
      const f=path.join(dir,'main.cpp');
      const pch=path.join(dir,'lc_pch.h');
      const hasMain=/\bmain\s*\(/.test(code);
      fs.writeFileSync(pch,"#include <algorithm>\n#include <climits>\n#include <cmath>\n#include <cstring>\n#include <functional>\n#include <iostream>\n#include <map>\n#include <numeric>\n#include <queue>\n#include <set>\n#include <sstream>\n#include <stack>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <utility>\n#include <vector>\nusing namespace std;\n");
      fs.writeFileSync(f, hasMain?code:code+"\n\nint main(){ return 0; }\n");
      const out=path.join(dir,process.platform==='win32'?'main.exe':'main');
      const gppArgs=['-std=c++17','-O2']; if(process.platform==='win32') gppArgs.push('-mconsole'); gppArgs.push('-include',pch,f,'-o',out);
      await execFileP('g++',gppArgs,{timeout:15000});
      return res.json({ok:true,message:'C++ compilation passed.'});
    }
    return res.status(400).json({ok:false,error:'Supported languages: Java, Python, C++'});
  }catch(e){
    res.json({ok:false,message:(e.stderr||e.stdout||e.message||'Compilation failed').toString()});
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

app.post('/api/run',async(req,res)=>{
  const {language,code,input=''}=req.body||{};
  if(!code)return res.status(400).json({ok:false,error:'No code'});
  const dir=tmpDir();
  try{
    if(language==='python'){
      const f=path.join(dir,'main.py');fs.writeFileSync(f,code);
      const r=await execFileP('python',[f],{input,timeout:5000,maxBuffer:1024*1024});
      return res.json({ok:true,stdout:r.stdout,stderr:r.stderr});
    }
    if(language==='java'){
      const f=path.join(dir,'Main.java');fs.writeFileSync(f,code);
      await execFileP('javac',['-encoding','UTF-8',f],{timeout:10000});
      const r=await execFileP('java',['-cp',dir,'Main'],{input,timeout:5000,maxBuffer:1024*1024});
      return res.json({ok:true,stdout:r.stdout,stderr:r.stderr});
    }
    if(language==='cpp'){
      const f=path.join(dir,'main.cpp');
      const pch=path.join(dir,'lc_pch.h');
      const hasMain=/\bmain\s*\(/.test(code);
      fs.writeFileSync(pch,"#include <algorithm>\n#include <climits>\n#include <cmath>\n#include <cstring>\n#include <functional>\n#include <iostream>\n#include <map>\n#include <numeric>\n#include <queue>\n#include <set>\n#include <sstream>\n#include <stack>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <utility>\n#include <vector>\nusing namespace std;\n");
      fs.writeFileSync(f, hasMain?code:code+"\n\nint main(){ return 0; }\n");
      const out=path.join(dir,process.platform==='win32'?'main.exe':'main');
      const gppArgs=['-std=c++17','-O2']; if(process.platform==='win32') gppArgs.push('-mconsole'); gppArgs.push('-include',pch,f,'-o',out);
      await execFileP('g++',gppArgs,{timeout:15000});
      const r=await execFileP(out,[],{input,timeout:5000,maxBuffer:1024*1024,cwd:dir});
      return res.json({ok:true,stdout:r.stdout,stderr:r.stderr});
    }
    return res.status(400).json({ok:false,error:'Supported languages: Java, Python, C++'});
  }catch(e){
    res.json({ok:false,stdout:e.stdout||'',stderr:e.stderr||e.message});
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

const TRACER_TEMPLATE=(watchArg)=>{
  const watchSrc=Array.isArray(watchArg)?JSON.stringify(watchArg):'None';
  return `
import sys,json,traceback
USERFILE='user.py'
watch=${watchSrc}
events=[]
callstack=[]
MAX_EVENTS=6000
def _slim(v,seen,cap=80):
    if v is None or type(v) in (int,float,bool,str):
        return v
    if callable(v) or isinstance(v,type(sys)) or isinstance(v,type(print)):
        return {'_str':repr(v)[:60]}
    if isinstance(v,(list,tuple)):
        return {'_arr':[_slim(x,seen,cap) for x in v[:36]]}
    if isinstance(v,set):
        return {'_set':[_slim(x,seen,cap) for x in list(v)[:36]]}
    if isinstance(v,dict):
        d={}
        for i,(k,val) in enumerate(v.items()):
            if i>=36:break
            d[str(k)]=_slim(val,seen,cap)
        return {'_map':d}
    vid=id(v)
    if vid in seen:
        return {'_ref':seen[vid]}
    if len(seen)>=cap:
        return {'_str':repr(v)[:90]}
    seen[vid]=str(vid)
    attrs={}
    for k,val in vars(v).items():
        try:
            attrs[k]=_slim(val,seen,cap)
        except Exception:
            attrs[k]={'_str':repr(val)[:90]}
    return {'_obj':attrs,'_id':seen[vid],'_type':type(v).__name__}
def _snap(frame):
    seen={}
    out={}
    for k,v in frame.f_locals.items():
        if k in ('events','trace','callstack','watch') or k.startswith('__'):
            continue
        if callable(v) or isinstance(v,type(sys)) or isinstance(v,type(print)):
            continue
        try:
            out[k]=_slim(v,seen)
        except Exception:
            out[k]={'_str':repr(v)[:90]}
    return out
def _current_fn():
    if callstack:
        return callstack[-1]['fn']
    return '<module>'
line_count=0
def trace(frame,event,arg):
    global line_count
    if event=='call':
        if frame.f_code.co_filename==USERFILE:
            callstack.append({'fn':frame.f_code.co_name or '<module>','line':frame.f_lineno})
        return trace
    if event=='return' and callstack:
        callstack.pop()
        return trace
    if event=='line' and frame.f_code.co_filename==USERFILE:
        line_count+=1
        if line_count>MAX_EVENTS:
            events.append({'error':'Trace exceeded '+str(MAX_EVENTS)+' steps (possible infinite loop).'})
            sys.settrace(None)
            return trace
        events.append({'line':frame.f_lineno,'fn':_current_fn(),'depth':len(callstack),'vars':_snap(frame)})
    return trace
sys.settrace(trace)
try:
    with open(USERFILE,'r',encoding='utf-8') as _f:
        _code=_f.read()
    _ug={'__name__':'__main__','__file__':USERFILE}
    exec(compile(_code,USERFILE,'exec'),_ug,_ug)
except BaseException as e:
    events.append({'error':repr(e),'traceback':traceback.format_exc().split('\\n')[-3:]})
finally:
    sys.settrace(None)
print('__LC_TRACE__'+json.dumps(events))
`;
};

app.post('/api/debug/python',async(req,res)=>{
  const {code,watch}=req.body||{};
  if(!code)return res.status(400).json({error:'No code'});
  const dir=tmpDir(),file=path.join(dir,'main.py'),userfile=path.join(dir,'user.py');
  const tracer=TRACER_TEMPLATE(Array.isArray(watch)?watch:null);
  try{
    fs.writeFileSync(userfile,code);
    fs.writeFileSync(file,tracer);
    const r=await execFileP('python',[file],{timeout:15000,maxBuffer:8*1024*1024,cwd:dir});
    const line=(r.stdout.split('\n').find(x=>x.startsWith('__LC_TRACE__'))||'');
    const events=line?JSON.parse(line.slice(12)):[];
    if(events.length===0&&r.stderr)events.push({error:r.stderr.slice(0,500)});
    res.json({ok:true,events,stdout:r.stdout.replace(line,'').trim(),stderr:r.stderr});
  }catch(e){
    res.json({ok:false,events:[],stdout:e.stdout||'',stderr:e.stderr||e.message});
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

app.listen(process.env.PORT||3000,()=>console.log('LeetCode Revision Lab → http://localhost:'+(process.env.PORT||3000)));
