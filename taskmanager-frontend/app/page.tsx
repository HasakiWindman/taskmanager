
"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
  const [authLoaded, setAuthLoaded] = useState(false);

  // Register a new user
  async function register() {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const message = await response.text();
      alert(message || (response.ok ? "Registered" : "Registration failed"));
    } catch {
      alert("Cannot connect to the backend");
    }
  }

  // Log in and save JWT
  async function login() {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
      setPassword("");
    } catch {
      alert("Cannot connect to the backend");
    }
  }

  // Log out
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
  }

  // GET: Load tasks belonging to the logged-in user
  async function loadTasks() {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }

  // Restore JWT when the page refreshes
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }

    setAuthLoaded(true);
  }, []);

  // Load tasks whenever the token changes
  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  // POST: Create a task
  async function addTask() {
    if (!title.trim() || !token) return;

    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title,
        completed: false,
      }),
    });

    if (response.ok) {
      setTitle("");
      loadTasks();
    } else {
      alert("Failed to add task");
    }
  }

  // PUT: Update a task
  async function completeTask(task: Task) {
    if (!token) return;

    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: task.title,
        completed: !task.completed,
      }),
    });

    if (response.ok) {
      loadTasks();
    } else {
      alert("Failed to update task");
    }
  }

  // DELETE: Delete a task
  async function deleteTask(id: number) {
    if (!token) return;

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      loadTasks();
    } else {
      alert("Failed to delete task");
    }
  }

  // Wait until we check for a saved login
  if (!authLoaded) {
    return null;
  }

  // Login and registration page
  if (!token) {
    return (
      <main className="page">
        <div className="card">
          <h1>Login</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") login();
            }}
          />

          <button onClick={login}>Login</button>
          <button onClick={register}>Register</button>
        </div>
      </main>
    );
  }

  // Task Manager page
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
