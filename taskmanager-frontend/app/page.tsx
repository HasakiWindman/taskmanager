"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type Task = { id: number; title: string; completed: boolean; priority: Priority | null; category: string | null; dueDate: string | null };
type TaskDraft = { title: string; completed: boolean; priority: Priority; category: string; dueDate: string };
const emptyDraft: TaskDraft = { title: "", completed: false, priority: "MEDIUM", category: "General", dueDate: "" };
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [editing, setEditing] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
    setEditing(null);
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setReady(true);
  }, []);

  const loadTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401) { logout(); setMessage("Your session expired. Please log in."); return; }
      if (!response.ok) throw new Error(`Unable to load tasks (${response.status})`);
      setTasks(await response.json());
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to connect to server");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  async function authenticate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/auth/${authMode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = await response.text();
      if (!response.ok) throw new Error(body || "Authentication failed");
      if (authMode === "register") {
        if (body !== "User registered") throw new Error(body || "Registration failed");
        setAuthMode("login");
        setMessage("Account created. Log in to continue.");
      } else {
        if (!body.startsWith("eyJ")) throw new Error(body || "Invalid login");
        localStorage.setItem("token", body);
        setToken(body);
        setPassword("");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cannot reach the backend");
    } finally { setBusy(false); }
  }

  async function saveTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !draft.title.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(editing === null ? `${API}/tasks` : `${API}/tasks/${editing}`, {
        method: editing === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...draft, title: draft.title.trim(), category: draft.category.trim() || "General", dueDate: draft.dueDate || null }),
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error(`Could not save task (${response.status})`);
      setDraft(emptyDraft);
      setEditing(null);
      await loadTasks();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusy(false); }
  }

  async function changeTask(task: Task, updates: Partial<TaskDraft>) {
    if (!token) return;
    setBusy(true);
    try {
      const response = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: task.title, completed: task.completed, priority: task.priority || "MEDIUM", category: task.category || "General", dueDate: task.dueDate, ...updates }),
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error("Could not update task");
      await loadTasks();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Update failed"); }
    finally { setBusy(false); }
  }

  async function deleteTask(id: number) {
    if (!token) return;
    setBusy(true);
    try {
      const response = await fetch(`${API}/tasks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error("Could not delete task");
      if (editing === id) { setEditing(null); setDraft(emptyDraft); }
      await loadTasks();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  function startEdit(task: Task) {
    setEditing(task.id);
    setDraft({ title: task.title, completed: task.completed, priority: task.priority || "MEDIUM", category: task.category || "General", dueDate: task.dueDate || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.length - completed;
  const overdue = tasks.filter((task) => !task.completed && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)).length;
  const visible = useMemo(() => {
    const priorityRank: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return tasks.filter((task) => {
      const textMatch = [task.title, task.category || "General"].join(" ").toLowerCase().includes(search.toLowerCase());
      return textMatch && (status === "all" || (status === "active" ? !task.completed : task.completed));
    }).sort((a, b) => {
      if (sort === "priority") return priorityRank[a.priority || "MEDIUM"] - priorityRank[b.priority || "MEDIUM"];
      if (sort === "name") return a.title.localeCompare(b.title);
      return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
    });
  }, [tasks, search, status, sort]);

  if (!ready) return <main className="shell"><div className="loading">Loading workspace…</div></main>;

  if (!token) return (
    <main className="authPage">
      <section className="authAside">
        <div className="brand brandLight"><span className="brandIcon">✓</span> Focusboard</div>
        <div><p className="eyebrow">YOUR PRODUCTIVITY WORKSPACE</p><h1>Make space for<br /><em>what matters.</em></h1><p className="intro">Organize your priorities, stay ahead of deadlines, and turn plans into progress.</p></div>
        <p className="asideFooter">Plan clearly. Build consistently.</p>
      </section>
      <section className="authPanel">
        <form className="authCard" onSubmit={authenticate}>
          <div className="mobileBrand"><span className="brandIcon">✓</span> Focusboard</div>
          <p className="eyebrow">WELCOME TO FOCUSBOARD</p>
          <h2>{authMode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="muted">{authMode === "login" ? "Sign in to continue your work." : "Start your productivity journey today."}</p>
          <label>Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input type="password" minLength={6} required autoComplete={authMode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          {message && <p className="notice" role="status">{message}</p>}
          <button className="primary full" disabled={busy}>{busy ? "Connecting…" : authMode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
          <p className="switch">{authMode === "login" ? "New here?" : "Already have an account?"} <button type="button" className="textButton" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setMessage(""); }}>{authMode === "login" ? "Create an account" : "Sign in"}</button></p>
        </form>
      </section>
    </main>
  );

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandIcon">✓</span> Focusboard</div>
        <div className="sideSection">WORKSPACE</div>
        <nav className="sideNav"><span className="navSelected">▦ <span>Overview</span></span><span>◷ <span>My tasks</span></span></nav>
        <div className="sidebarBottom"><div className="accountAvatar">{tasks.length ? "F" : "✓"}</div><div><strong>My workspace</strong><small>Personal account</small></div><button className="logout" onClick={logout} title="Log out">↗</button></div>
      </aside>
      <div className="workspace">
        <header className="topbar"><div><span className="breadcrumb">Workspace</span><span className="slash"> / </span><strong>Overview</strong></div><button className="logoutTop" onClick={logout}>Log out ↗</button></header>
        <div className="content">
          <div className="hero"><div><p className="eyebrow">YOUR DASHBOARD</p><h1>Make today count<span className="accentDot">.</span></h1><p className="muted">Everything you need to stay organized and on track.</p></div><div className="datePill">◷ &nbsp; {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div></div>
          <section className="stats">
            <div className="statCard"><div className="statIcon blue">▦</div><p>Total tasks</p><strong>{tasks.length}</strong><span>Across your workspace</span></div>
            <div className="statCard"><div className="statIcon gold">◷</div><p>In progress</p><strong>{active}</strong><span>Keep your momentum</span></div>
            <div className="statCard"><div className="statIcon green">✓</div><p>Completed</p><strong>{completed}</strong><span>{tasks.length ? Math.round((completed / tasks.length) * 100) : 0}% completion rate</span></div>
            <div className="statCard"><div className="statIcon red">!</div><p>Overdue</p><strong>{overdue}</strong><span>Need your attention</span></div>
          </section>
          <div className="sectionTitle"><div><p className="eyebrow">STAY ON TOP</p><h2>{editing === null ? "Create a task" : "Edit your task"}</h2></div></div>
          <form className="createCard" onSubmit={saveTask}>
            <label className="titleInputLabel">Task name<input required maxLength={200} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to get done?" /></label>
            <div className="formGrid">
              <label>Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}>{priorities.map((p) => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}</select></label>
              <label>Category<input maxLength={50} value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="General" /></label>
              <label>Due date<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
            </div>
            <div className="formActions">{editing !== null && <button type="button" className="secondary" onClick={() => { setEditing(null); setDraft(emptyDraft); }}>Cancel</button>}<button className="primary" disabled={busy || !draft.title.trim()}>{editing === null ? "+ Add task" : "Save changes"}</button></div>
          </form>
          <div className="sectionTitle tasksHeading"><div><p className="eyebrow">YOUR TO-DO LIST</p><h2>My tasks <span className="taskCount">{tasks.length}</span></h2></div><button className="secondary refresh" onClick={() => void loadTasks()} disabled={loading}>↻ Refresh</button></div>
          <div className="taskPanel"><div className="toolbar"><input aria-label="Search tasks" className="search" placeholder="⌕  Search tasks or categories..." value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All tasks</option><option value="active">In progress</option><option value="done">Completed</option></select><select aria-label="Sort tasks" value={sort} onChange={(event) => setSort(event.target.value)}><option value="due">Due date</option><option value="priority">Priority</option><option value="name">Name</option></select></div>
            {message && <div className="notice" role="status">{message}</div>}
            {loading && <p className="loading">Loading tasks…</p>}
            {!loading && !visible.length && <div className="empty"><div className="emptyIcon">✓</div><h3>{tasks.length ? "No matching tasks" : "A fresh start"}</h3><p>{tasks.length ? "Try changing your search or filters." : "Create your first task above and make progress today."}</p></div>}
            <div className="taskRows">{visible.map((task) => <div className="taskRow" key={task.id}>
              <button type="button" aria-label={task.completed ? "Mark incomplete" : "Mark complete"} className={`checkCircle ${task.completed ? "checked" : ""}`} disabled={busy} onClick={() => void changeTask(task, { completed: !task.completed })}>{task.completed ? "✓" : ""}</button>
              <div className="taskInfo"><strong className={task.completed ? "finished" : ""}>{task.title}</strong><div className="taskMeta"><span className="categoryTag">{task.category || "General"}</span>{task.dueDate && <span className={task.dueDate < new Date().toISOString().slice(0, 10) && !task.completed ? "overdueText" : ""}>◷ {task.dueDate}</span>}</div></div>
              <span className={`priority priority${task.priority || "MEDIUM"}`}>{task.priority || "MEDIUM"}</span>
              <div className="rowActions"><button disabled={busy} title="Edit task" onClick={() => startEdit(task)}>✎</button><button disabled={busy} title="Delete task" onClick={() => void deleteTask(task.id)}>×</button></div>
            </div>)}</div>
          </div>
          <footer className="footer">FOCUSBOARD · Organize better. Achieve more.</footer>
        </div>
      </div>
    </main>
  );
}
