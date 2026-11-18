const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
const util = require("util");
const execFileP = util.promisify(execFile);

const app = express();
app.use(express.json({ limit: "4mb" }));

// CORS for Next.js dev
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "lc-lab-"));
}

// --- System Status ---
app.get("/api/system/status", async (req, res) => {
  const status = { node: true, java: false, javac: false, python: false, gpp: false };
  try {
    await execFileP("java", ["-version"], { timeout: 5000 });
    status.java = true;
  } catch {}
  try {
    await execFileP("javac", ["-version"], { timeout: 5000 });
    status.javac = true;
  } catch {}
  try {
    await execFileP("python", ["--version"], { timeout: 5000 });
    status.python = true;
  } catch {}
  try {
    await execFileP("g++", ["--version"], { timeout: 5000 });
    status.gpp = true;
  } catch {}
  res.json(status);
});

// --- Execute Code ---
app.post("/api/execute", async (req, res) => {
  const { language, code, input = "" } = req.body || {};
  if (!code) return res.status(400).json({ ok: false, error: "No code" });

  const dir = tmpDir();
  const startTime = Date.now();
  try {
    if (language === "python") {
      const f = path.join(dir, "main.py");
      fs.writeFileSync(f, code, "utf-8");
      const r = await execFileP("python", [f], {
        input,
        timeout: 8000,
        maxBuffer: 1024 * 1024,
        cwd: dir,
      });
      return res.json({
        ok: true,
        stdout: r.stdout,
        stderr: r.stderr,
        exitCode: 0,
        duration: Date.now() - startTime,
      });
    }
    if (language === "java") {
      const f = path.join(dir, "Main.java");
      fs.writeFileSync(f, code, "utf-8");
      await execFileP("javac", ["-encoding", "UTF-8", f], { timeout: 10000 });
      const r = await execFileP("java", ["-cp", dir, "Main"], {
        input,
        timeout: 8000,
        maxBuffer: 1024 * 1024,
      });
      return res.json({
        ok: true,
        stdout: r.stdout,
        stderr: r.stderr,
        exitCode: 0,
        duration: Date.now() - startTime,
      });
    }
    if (language === "cpp") {
      const f = path.join(dir, "main.cpp");
      const pch = path.join(dir, "lc_pch.h");
      const out = path.join(dir, process.platform === "win32" ? "main.exe" : "main");
      const prelude = [
        "#include <algorithm>",
        "#include <climits>",
        "#include <cmath>",
        "#include <cstring>",
        "#include <functional>",
        "#include <iostream>",
        "#include <map>",
        "#include <numeric>",
        "#include <queue>",
        "#include <set>",
        "#include <sstream>",
        "#include <stack>",
        "#include <string>",
        "#include <unordered_map>",
        "#include <unordered_set>",
        "#include <utility>",
        "#include <vector>",
        "using namespace std;",
        ""
      ].join("\n");
      const hasMain = /\bmain\s*\(/.test(code);
      const source = hasMain ? code : code + "\n\nint main(){ return 0; }\n";
      fs.writeFileSync(pch, prelude, "utf-8");
      fs.writeFileSync(f, source, "utf-8");
      const gppArgs = ["-std=c++17", "-O2"];
      if (process.platform === "win32") gppArgs.push("-mconsole");
      gppArgs.push("-include", pch, f, "-o", out);
      await execFileP("g++", gppArgs, { timeout: 15000, cwd: dir });
      const r = await execFileP(out, [], {
        input,
        timeout: 8000,
        maxBuffer: 1024 * 1024,
        cwd: dir,
      });
      return res.json({
        ok: true,
        stdout: r.stdout,
        stderr: r.stderr,
        exitCode: 0,
        duration: Date.now() - startTime,
      });
    }
    return res.status(400).json({ ok: false, error: "Supported: java, python, cpp" });
  } catch (e) {
    res.json({
      ok: false,
      stdout: e.stdout || "",
      stderr: e.stderr || e.message,
      exitCode: e.code || 1,
      duration: Date.now() - startTime,
    });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

// --- Python Trace (Debug) ---
const TRACER_TEMPLATE = `
import sys,json,traceback
USERFILE='user.py'
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
            events.append({'step':len(events),'type':'exception','line':frame.f_lineno,'fn':_current_fn(),'depth':len(callstack),'vars':{'error':'Trace limit exceeded ('+str(MAX_EVENTS)+' steps). Possible infinite loop or very long run. Try smaller input or add a base case.'}})
            sys.settrace(None)
            return trace
        events.append({'step':line_count-1,'type':'line','line':frame.f_lineno,'fn':_current_fn(),'depth':len(callstack),'vars':_snap(frame)})
    return trace
sys.settrace(trace)
try:
    with open(USERFILE,'r',encoding='utf-8') as _f:
        _code=_f.read()
    _ug={'__name__':'__main__','__file__':USERFILE}
    exec(compile(_code,USERFILE,'exec'),_ug,_ug)
except BaseException as e:
    err_line=0
    err_fn='<module>'
    try:
        if isinstance(e, SyntaxError) and str(getattr(e,'filename','') or '').endswith(USERFILE):
            err_line=getattr(e,'lineno',0) or 0
        else:
            tb=traceback.extract_tb(e.__traceback__)
            for fr in reversed(tb):
                fnm=str(getattr(fr,'filename','') or '')
                if fnm==USERFILE or fnm.endswith(USERFILE):
                    err_line=getattr(fr,'lineno',0) or 0
                    err_fn=getattr(fr,'name',None) or '<module>'
                    break
    except Exception:
        pass
    events.append({'step':len(events),'type':'exception','line':err_line,'fn':err_fn,'depth':len(callstack) if 'callstack' in locals() else 0,'vars':{'error':'{}: {}'.format(type(e).__name__, e),'traceback':traceback.format_exc().strip().splitlines()[-4:]}})
finally:
    sys.settrace(None)
print('__LC_TRACE__'+json.dumps(events))
`;

app.post("/api/debug/trace", async (req, res) => {
  const { language, code, input = "" } = req.body || {};
  if (!code) return res.status(400).json({ ok: false, error: "No code" });
  if (language !== "python") {
    return res.status(400).json({ ok: false, error: "Debug currently supports Python only" });
  }

  const dir = tmpDir();
  const file = path.join(dir, "main.py");
  const userfile = path.join(dir, "user.py");
  try {
    fs.writeFileSync(userfile, code, "utf-8");
    fs.writeFileSync(file, TRACER_TEMPLATE, "utf-8");
    const r = await execFileP("python", [file], {
      timeout: 15000,
      maxBuffer: 8 * 1024 * 1024,
      cwd: dir,
      input,
    });
    const marker = "__LC_TRACE__";
    const idx = r.stdout.lastIndexOf(marker);
    let events = [];
    let cleanStdout = r.stdout;
    if (idx !== -1) {
      const after = r.stdout.slice(idx + marker.length);
      const nl = after.indexOf("\n");
      const jsonStr = (nl === -1 ? after : after.slice(0, nl)).trim();
      try { events = JSON.parse(jsonStr || "[]"); } catch { events = []; }
      const end = nl === -1 ? r.stdout.length : idx + marker.length + nl + 1;
      cleanStdout = (r.stdout.slice(0, idx) + r.stdout.slice(end)).trim();
    }
    if (events.length === 0 && r.stderr) {
      events.push({ step: 0, type: "exception", line: 0, fn: "<error>", depth: 0, vars: { error: r.stderr.slice(0, 500) } });
    }
    if (events.length === 0 && !r.stderr) {
      events.push({ step: 0, type: "exception", line: 0, fn: "<error>", depth: 0, vars: { error: "No trace steps captured. Make sure your code runs and reaches executable lines." } });
    }
    res.json({ ok: true, events, stdout: cleanStdout, stderr: r.stderr });
  } catch (e) {
    const stdout = e.stdout || "";
    const marker = "__LC_TRACE__";
    const idx = stdout.lastIndexOf(marker);
    let events = [];
    let cleanStdout = stdout;
    if (idx !== -1) {
      const after = stdout.slice(idx + marker.length);
      const nl = after.indexOf("\n");
      const jsonStr = (nl === -1 ? after : after.slice(0, nl)).trim();
      try { events = JSON.parse(jsonStr || "[]"); } catch { events = []; }
      const end = nl === -1 ? stdout.length : idx + marker.length + nl + 1;
      cleanStdout = (stdout.slice(0, idx) + stdout.slice(end)).trim();
    }
    if (events.length) {
      return res.json({ ok: true, events, stdout: cleanStdout, stderr: e.stderr || "" });
    }
    const msg = (e.stderr || e.message || "Debug failed");
    const timedOut = /timed? ?out|ETIMEDOUT|timeout/i.test(String(e.message || "")) || e.killed;
    const friendly = timedOut
      ? "Debug timed out. Your code may have an infinite loop or be waiting for input (stdin). Try adding a base case, check loop conditions, or provide input in the Tests tab."
      : msg;
    events = [{ step: 0, type: "exception", line: 0, fn: "<error>", depth: 0, vars: { error: String(friendly).slice(0, 1200) } }];
    res.json({ ok: true, events, stdout: cleanStdout, stderr: e.stderr || String(e.message || "") });  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

const PORT = process.env.COMPANION_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Companion server â†’ http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log("  GET  /api/system/status");
  console.log("  POST /api/execute");
  console.log("  POST /api/debug/trace");
});
