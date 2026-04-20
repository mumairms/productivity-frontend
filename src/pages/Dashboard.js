import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Dashboard() {

  // 🔥 PROTECT ROUTE
  if (!localStorage.getItem("token")) {
    window.location.href = "/";
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });

  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", tasks: 0 },
    { day: "Tue", tasks: 0 },
    { day: "Wed", tasks: 0 },
    { day: "Thu", tasks: 0 },
    { day: "Fri", tasks: 0 },
    { day: "Sat", tasks: 0 },
    { day: "Sun", tasks: 0 },
  ]);

  const [task, setTask] = useState("");
  const [taskList, setTaskList] = useState([]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [time, setTime] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = "https://productivity-backend-ccxh.onrender.com";

  // FETCH TASKS
  useEffect(() => {
    setLoading(true);

    fetch(`${API}/api/tasks`, {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => {
        setTaskList(data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Failed to load tasks");
        setLoading(false);
      });
  }, []);

  // CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ADD TASK
  const addTask = () => {
    if (task.trim() === "") return;

    fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({ text: task })
    })
      .then(res => res.json())
      .then(newTask => {
        setTaskList(prev => [...prev, newTask]);
      });

    setWeeklyData(prev =>
      prev.map(d =>
        d.day === today ? { ...d, tasks: d.tasks + 1 } : d
      )
    );

    setTask("");
  };

  // DELETE TASK
  const deleteTask = (id) => {
    fetch(`${API}/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    })
      .then(() => {
        setTaskList(prev => prev.filter(t => t._id !== id));
      });
  };

  // TOGGLE TASK
  const toggleTask = (task) => {
    fetch(`${API}/api/tasks/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({ completed: !task.completed })
    })
      .then(res => res.json())
      .then(updated => {
        setTaskList(prev =>
          prev.map(t => (t._id === updated._id ? updated : t))
        );
      });
  };

  if (loading) return <h2 className="p-6">Loading...</h2>;

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Productivity</h2>

        <ul>
          <li className="mb-4">Dashboard</li>
          <li className="mb-4">Tasks</li>
          <li className="mb-4">Goals</li>
          <li className="mb-4">Settings</li>
        </ul>

        {/* 🔥 LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            window.location.href = "/";
          }}
          className="mt-6 bg-red-500 px-3 py-2 rounded w-full"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">

        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

        {/* 🔥 USER EMAIL */}
        <p className="text-gray-600 mb-2">
          Welcome, {localStorage.getItem("email")}
        </p>

        <p className="text-gray-500 mb-4">
          {time.toLocaleTimeString()}
        </p>

        {error && <p className="text-red-500">{error}</p>}

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded shadow">
            <h3>Tasks</h3>
            <p className="text-2xl">{taskList.length}</p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3>Completed</h3>
            <p className="text-2xl">
              {taskList.filter(t => t.completed).length}
            </p>
          </div>

          <div className="bg-white p-5 rounded shadow">
            <h3>Pending</h3>
            <p className="text-2xl">
              {taskList.filter(t => !t.completed).length}
            </p>
          </div>
        </div>

        {/* Graph */}
        <div className="bg-white p-5 rounded shadow mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task System */}
        <div className="bg-white p-5 rounded shadow mt-6">

          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add task..."
            className="p-2 border w-full mb-3"
          />

          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Add Task
          </button>

          <ul className="mt-4">
            {taskList.map(t => (
              <li key={t._id} className="flex justify-between mb-2">
                <span
                  onClick={() => toggleTask(t)}
                  className={t.completed ? "line-through" : ""}
                >
                  {t.text}
                </span>

                <button onClick={() => deleteTask(t._id)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;