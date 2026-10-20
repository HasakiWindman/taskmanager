"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

async function register() {
  const response = await fetch("http://localhost:8080/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const message = await response.text();
  alert(message);
}

async function login() {
  const response = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const jwt = await response.text();

  if (!response.ok || !jwt.startsWith("eyJ")) {
    alert(jwt || "Login failed");
    return;
  }

  localStorage.setItem("token", jwt);
  setToken(jwt);



}
function logout() {
  localStorage.removeItem("token");
  setToken(null);
  setTasks([]);
}

  function loadTasks() {
  if (!token) return;

  fetch("http://localhost:8080/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => setTasks(data));
}
  useEffect(() => {
  const savedToken = localStorage.getItem("token");

  if (savedToken) {
    setToken(savedToken);
  }
  }, []);
  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  function addTask() {
    if (!title.trim()) return;

    fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
},
      body: JSON.stringify({
        title: title,
        completed: false,
      }),
    }).then(() => {
      setTitle("");
      loadTasks();
    });
  }

  function completeTask(task: Task) {
    fetch(`http://localhost:8080/tasks/${task.id}`, {
      method: "PUT",
      headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
},
      body: JSON.stringify({
        title: task.title,
        completed: !task.completed,
      }),
    }).then(() => loadTasks());
  }

  function deleteTask(id: number) {
    fetch(`http://localhost:8080/tasks/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
}).then(() => loadTasks());
  }
if (!token) {
  return (
    <main className="page">
      <div className="card">
        <h1>Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    </main>
  );
}
  return (
    <main className="page">
      <div className="card">
        <h1>Task Manager</h1>
        <button onClick={logout}>Logout</button>

        <div className="addRow">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a task"
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />

          <button onClick={addTask}>Add</button>
        </div>

        <div className="taskList">
          {tasks.map((task) => (
            <div className="taskRow" key={task.id}>
              <span className={task.completed ? "done" : ""}>
                {task.title}
              </span>

              <div className="buttons">
                <button onClick={() => completeTask(task)}>
                  {task.completed ? "Undo" : "Done"}
                </button>

                <button onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}