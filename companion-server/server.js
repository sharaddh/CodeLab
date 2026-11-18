const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
const util = require("util");
const execFileP = util.promisify(execFile);

const app = express();
app.use(express.json({ limit: "4mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  res.json({ ok: true, service: "lc-lab-companion" });
});

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "lc-lab-"));
}

// --- System Status ---
app.get("/api/system/status", async (req, res) => {
  const status = { node: true, java: false, javac: false, python: false, gpp: false };
  const pyCmd = process.platform === "win32" ? "python" : "python3";
  try {
    await execFileP("java", ["-version"], { timeout: 5000 });
    status.java = true;
  } catch {}
  try {
    await execFileP("javac", ["-version"], { timeout: 5000 });
    status.javac = true;
  } catch {}
  try {
    await execFileP(pyCmd, ["--version"], { timeout: 5000 });
    status.python = true;
  } catch {
    if (pyCmd !== "python") {
      try { await execFileP("python", ["--version"], { timeout: 5000 }); status.python = true; } catch {}
    }
  }
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
      const pyCmd = process.platform === "win32" ? "python" : "python3";
      const f = path.join(dir, "main.py");
      fs.writeFileSync(f, code, "utf-8");
      let r;
      try {
        r = await execFileP(pyCmd, [f], { input, timeout: 8000, maxBuffer: 1024 * 1024, cwd: dir });
      } catch (e) {
        if (e.code === "ENOENT" && pyCmd !== "python") {
          r = await execFileP("python", [f], { input, timeout: 8000, maxBuffer: 1024 * 1024, cwd: dir });
        } else {
          throw e;
        }
      }
      return res.json({ ok: true, stdout: r.stdout, stderr: r.stderr, exitCode: 0, duration: Date.now() - startTime });
    }
    if (language === "java") {
      const f = path.join(dir, "Main.java");
      fs.writeFileSync(f, code, "utf-8");
      await execFileP("javac", ["-encoding", "UTF-8", f], { timeout: 10000 });
      const r = await execFileP("java", ["-cp", dir, "Main"], { input, timeout: 8000, maxBuffer: 1024 * 1024 });
      return res.json({ ok: true, stdout: r.stdout, stderr: r.stderr, exitCode: 0, duration: Date.now() - startTime });
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
      await execFileP("g++", gppArgs, { timeout: 12000, cwd: dir });
      const r = await execFileP(out, [], { input, timeout: 8000, maxBuffer: 1024 * 1024, cwd: dir });
      return res.json({ ok: true, stdout: r.stdout, stderr: r.stderr, exitCode: 0, duration: Date.now() - startTime });
    }
    return res.status(400).json({ ok: false, error: "Unsupported language" });
  } catch (e) {
    const stderr = e.stderr || e.message || "Execution failed";
    res.json({ ok: false, stdout: e.stdout || "", stderr: String(stderr), exitCode: e.code || 1, duration: Date.now() - startTime });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

// --- Python Trace (Debug) ---
const TRACER_TEMPLATE = `
import sys,json,traceback
userfile='user.py'
with open(userfile,'r',encoding='utf-8') as f:
    src=f.read()
events=[]
max_events=600
MAX_DEPTH=40
callstack=[]
safe_builtins={k:getattr(__builtins__,k) for k in dir(__builtins__) if not k.startswith('_')} if not isinstance(__builtins__,dict) else {k:v for k,v in __builtins__.items() if not k.startswith('_')}
def _current_fn():
    return callstack[-1]['fn'] if callstack else '<module>'

def slim(v, depth=0):
    if depth>2: return '...'
    try:
        if v is None or isinstance(v,(bool,int,float)): return v
        if isinstance(v,str): return v if len(v)<=120 else v[:120]+'...'
        if isinstance(v,list): return {'_type':'list','_arr':[slim(x,depth+1) for x in v[:20]]}
        if isinstance(v,tuple): return {'_type':'tuple','_arr':[slim(x,depth+1) for x in v[:20]]}
        if isinstance(v,set): return {'_type':'set','_set':[slim(x,depth+1) for x in list(v)[:20]]}
        if isinstance(v,dict): return {'_type':'dict','_map':{str(k)[:40]:slim(val,depth+1) for i,(k,val) in enumerate(v.items()) if i<20}}
    except Exception:
        pass
    try: return str(v)[:120]
    except Exception: return '<unrepr>'

def snapshot(frame):
    out={}
    try:
        for k,v in list(frame.f_locals.items()):
            if k in ('events','trace','callstack','watch') or k.startswith('__'): continue
            out[k]=slim(v)
    except Exception:
        pass
    return out

def trace(frame,event,arg):
    global events
    fn=frame.f_code.co_filename
    if fn!=userfile: return trace
    if len(events)>=max_events:
        events.append({'step':len(events),'type':'exception','line':frame.f_lineno,'fn':_current_fn(),'depth':len(callstack),'vars':{'error':'Trace limit reached (600 steps). Possible infinite loop or very large input.'}})
        sys.settrace(None)
        return None
    try:
        if event=='call':
            callstack.append({'fn':frame.f_code.co_name,'line':frame.f_lineno})
            if len(callstack)>MAX_DEPTH:
                events.append({'step':len(events),'type':'exception','line':frame.f_lineno,'fn':frame.f_code.co_name,'depth':len(callstack),'vars':{'error':'Max call depth reached (possible infinite recursion).'}})
                sys.settrace(None)
                return None
        elif event in ('line','return'):
            events.append({'step':len(events),'type':event,'line':frame.f_lineno,'fn':_current_fn(),'depth':len(callstack),'vars':snapshot(frame)})
        elif event=='exception':
            exc_type, exc_val, _ = arg
            events.append({'step':len(events),'type':'exception','line':frame.f_lineno,'fn':_current_fn(),'depth':len(callstack),'vars':{'error':str(exc_val),'type':getattr(exc_type,'__name__','Exception')}})
        if event=='return' and callstack:
            callstack.pop()
    except Exception:
        pass
    return trace

g={'__name__':'__main__','__builtins__':__builtins__}
try:
    sys.settrace(trace)
    exec(compile(src,userfile,'exec'),g,g)
except Exception as e:
    tb = traceback.extract_tb(sys.exc_info()[2])
    err_line = 0
    err_fn = '<module>'
    for fr in reversed(tb):
        if fr.filename == userfile:
            err_line = fr.lineno or 0
            err_fn = fr.name or '<module>'
            break
    if err_line == 0:
        err_line = getattr(e, 'lineno', 0) or 0
    events.append({'step':len(events),'type':'exception','line':err_line,'fn':err_fn,'depth':len(callstack),'vars':{'error':'{}: {}'.format(type(e).__name__, e),'traceback':traceback.format_exc().strip().splitlines()[-4:]}})
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
  const pyCmd = process.platform === "win32" ? "python" : "python3";
  try {
    fs.writeFileSync(userfile, code, "utf-8");
    fs.writeFileSync(file, TRACER_TEMPLATE, "utf-8");
    let r;
    try {
      r = await execFileP(pyCmd, [file], { timeout: 15000, maxBuffer: 8 * 1024 * 1024, cwd: dir, input });
    } catch (e) {
      if (e.code === "ENOENT" && pyCmd !== "python") {
        r = await execFileP("python", [file], { timeout: 15000, maxBuffer: 8 * 1024 * 1024, cwd: dir, input });
      } else {
        throw e;
      }
    }
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
    if (e.code === "ENOENT") {
      const events = [{ step: 0, type: "exception", line: 0, fn: "<error>", depth: 0, vars: { error: "Python not found on server." } }];
      return res.json({ ok: true, events, stdout: "", stderr: "" });
    }
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
    res.json({ ok: true, events, stdout: cleanStdout, stderr: e.stderr || String(e.message || "") });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

const PORT = process.env.PORT || process.env.COMPANION_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Companion server -> http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log("  GET  /api/system/status");
  console.log("  POST /api/execute");
  console.log("  POST /api/debug/trace");
});
