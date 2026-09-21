"use client";

import dynamic from "next/dynamic";
import JSZip from "jszip";
import { useMemo, useState } from "react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ProjectFile = { name: string; language: string; code: string };

const starters: ProjectFile[] = [
  { name: "index.html", language: "html", code: "<!doctype html>\n<html>\n  <body>\n    <main id=\"app\"></main>\n    <script src=\"app.js\"></script>\n  </body>\n</html>" },
  { name: "app.js", language: "javascript", code: "const app = document.querySelector('#app');\napp.innerHTML = `\n  <section class=\"card\">\n    <span class=\"eyebrow\">TRIGGZ LAB</span>\n    <h1>Build beyond limits.</h1>\n    <p>Your live creative coding canvas is online.</p>\n    <button onclick=\"this.textContent='SYSTEMS NOMINAL ✓'\">INITIALIZE</button>\n  </section>\n`;" },
  { name: "styles.css", language: "css", code: "body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #09070f; color: #e8e6f0; font-family: system-ui; }\n.card { padding: 3rem; border: 1px solid #9bff4d; background: #121020; box-shadow: 0 0 60px #711cff33; }\n.eyebrow { color: #9bff4d; letter-spacing: .2em; font-size: .7rem; }\nh1 { font-size: 3rem; margin: 1rem 0; }\nbutton { background: #9bff4d; border: 0; padding: .8rem 1.2rem; font-weight: 800; cursor: pointer; }" }
];

const icons: Record<string, string> = { html: "◈", javascript: "JS", css: "#", python: "Py", sql: "DB", bash: ">_" };

export default function Home() {
  const [files, setFiles] = useState<ProjectFile[]>(starters);
  const [active, setActive] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState(["Welcome to TRIGGZ. Describe what you want to build."]);
  const [tab, setTab] = useState<"code" | "preview">("code");
  const [persona, setPersona] = useState("ARCHITECT");
  const current = files[active];
  const preview = useMemo(() => {
    const html = files.find(f => f.name.endsWith(".html"))?.code || "";
    const js = files.find(f => f.name.endsWith(".js"))?.code || "";
    const css = files.find(f => f.name.endsWith(".css"))?.code || "";
    return html.replace("</head>", `<style>${css}</style></head>`).replace("<script src=\"app.js\"></script>", `<script>${js}</script>`);
  }, [files]);

  function updateCode(value: string | undefined) {
    setFiles(prev => prev.map((f, i) => i === active ? { ...f, code: value || "" } : f));
  }
  function addFile() {
    const name = window.prompt("New file name", "component.tsx");
    if (!name) return;
    const language = name.split(".").pop() || "plaintext";
    setFiles(prev => [...prev, { name, language, code: "" }]);
    setActive(files.length);
  }
  async function downloadZip() {
    const zip = new JSZip();
    files.forEach(file => zip.file(file.name, file.code));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "triggz-project.zip"; a.click(); URL.revokeObjectURL(url);
  }
  function runPrompt() {
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, `You: ${prompt}`, `TRIGGZ: I’m drafting a ${persona.toLowerCase()} pass for your project. Connect an AI provider to generate files.`]);
    setPrompt("");
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">✦</span><span>TRIGGZ</span><small>AI CODE LAB</small></div><div className="project"><span className="status-dot"/> untitled-project <span className="branch">main⌄</span></div><div className="top-actions"><button className="ghost" onClick={() => setTab("preview")}>⌁ RUN</button><button className="export" onClick={downloadZip}>↓ EXPORT ZIP</button><span className="avatar">T</span></div></header>
    <div className="workspace">
      <aside className="rail"><button className="rail-active">▦<span>WORKSPACE</span></button><button>◉<span>LAYERS</span></button><button>⚙<span>SETTINGS</span></button><div className="rail-bottom">?</div></aside>
      <section className="files"><div className="panel-title"><span>PROJECT FILES</span><button onClick={addFile}>＋</button></div><div className="file-list">{files.map((file, i) => <button className={`file ${active === i ? "selected" : ""}`} key={file.name} onClick={() => { setActive(i); setTab("code"); }}><b>{icons[file.language] || "◇"}</b>{file.name}<span>•••</span></button>)}</div><div className="new-project"><span>✦</span><div><strong>GENERATE NEW</strong><small>Start from a prompt</small></div><button onClick={() => setMessages(prev => [...prev, "TRIGGZ: New project sequence armed."])}>↗</button></div></section>
      <section className="editor-area"><div className="tabs"><button className={tab === "code" ? "tab-active" : ""} onClick={() => setTab("code")}>⌘ {current.name}</button><button className={tab === "preview" ? "tab-active" : ""} onClick={() => setTab("preview")}>◉ LIVE PREVIEW</button><span className="save">● SAVED LOCALLY</span></div>{tab === "code" ? <Editor height="calc(100vh - 104px)" theme="vs-dark" language={current.language} value={current.code} onChange={updateCode} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 22 }, lineNumbers: "on", renderLineHighlight: "all", automaticLayout: true }} /> : <div className="preview-wrap"><div className="preview-bar"><span>● localhost:3000</span><button onClick={() => setTab("preview")}>↻ REFRESH</button></div><iframe title="Live preview" srcDoc={preview} sandbox="allow-scripts" /></div>}</section>
      <aside className="assistant"><div className="assistant-head"><div><span className="online">● ONLINE</span><h2>NEURAL LINK</h2></div><button>•••</button></div><div className="persona"><label>ACTIVE PERSONA</label><select value={persona} onChange={e => setPersona(e.target.value)}><option>ARCHITECT</option><option>DEBUGGER</option><option>FRONTEND WIZARD</option><option>CREATIVE WRITER</option></select></div><div className="messages">{messages.map((message, i) => <div className={message.startsWith("You:") ? "message user" : "message"} key={i}><span className="msg-icon">{message.startsWith("You:") ? "T" : "✦"}</span><p>{message}</p></div>)}</div><div className="prompt-box"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runPrompt(); } }} placeholder="Describe anything..."/><div className="prompt-foot"><span>↯ UNRESTRICTED MODE</span><button onClick={runPrompt}>SEND ↗</button></div></div></aside>
    </div>
  </main>;
}
