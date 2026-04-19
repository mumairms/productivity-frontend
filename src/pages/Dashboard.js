import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Dashboard() {

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

  // ✅ FIXED (MISSING STATES)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 FETCH TASKS
  useEffect(() => {
    setLoading(true);

    fetch("http://localhost:5000/api/tasks", {
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

  // ⏰ CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ➕ ADD TASK
  const addTask = () => {
    if (task.trim() === "") return;

    fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({
        text: task
      })
    })
      .then(res => res.json())
      .then(newTask => {
        setTaskList(prev => [...prev, newTask]);
      })
      .catch(err => console.log(err));

    setWeeklyData(prev =>
      prev.map(d =>
        d.day === today ? { ...d, tasks: d.tasks + 1 } : d
      )
    );

    setTask("");
  };

  // ❌ DELETE TASK
  const deleteTask = (id) => {
    fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token")
      }
    })
      .then(() => {
        setTaskList(prev => prev.filter(t => t._id !== id));
      })
      .catch(err => console.log(err));
  };

  // ✅ TOGGLE TASK
  const toggleTask = (task) => {
    fetch(`http://localhost:5000/api/tasks/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({
        completed: !task.completed
      })
    })
      .then(res => res.json())
      .then(updated => {
        setTaskList(prev =>
          prev.map(t => (t._id === updated._id ? updated : t))
        );
      })
      .catch(err => console.log(err));
  };

  // 🔄 LOADING
  if (loading) {
    return <h2 className="p-6">Loading dashboard...</h2>;
  }

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
      </div>

      {/* Main */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">

        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

        <p className="text-gray-500 mb-4">
          {time.toLocaleTimeString()}
        </p>

        {/* ❌ Error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h3>Tasks</h3>
            <p className="text-2xl font-bold">{taskList.length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3>Completed</h3>
            <p className="text-2xl font-bold">
              {taskList.filter(t => t.completed).length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3>Pending</h3>
            <p className="text-2xl font-bold">
              {taskList.filter(t => !t.completed).length}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white p-4 rounded-xl shadow mt-6">
          <h2 className="mb-2 font-semibold">Progress</h2>
          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-500 h-4 rounded"
              style={{
                width: `${
                  taskList.length === 0
                    ? 0
                    : (taskList.filter(t => t.completed).length / taskList.length) * 100
                }%`
              }}
            ></div>
          </div>
        </div>

        {/* Graph */}
        <div className="bg-white p-5 rounded-xl shadow mt-6">
          <h2 className="text-xl mb-4">Weekly Progress</h2>

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
        <div className="bg-white p-5 rounded-xl shadow mt-6">

          <h2 className="text-xl mb-4">Task Manager</h2>

          <div className="flex justify-between mb-4">
            <input
              placeholder="Search task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border rounded w-1/2"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter task..."
              className="flex-1 p-2 border rounded"
            />

            <button
              onClick={addTask}
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>

          {taskList.length === 0 ? (
            <p className="text-gray-400">No tasks yet. Start adding 🚀</p>
          ) : (
            <ul>
              {taskList
                .filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
                .filter(t =>
                  filter === "all"
                    ? true
                    : filter === "completed"
                    ? t.completed
                    : !t.completed
                )
                .map((t) => (
                  <li key={t._id} className="flex justify-between items-center mb-2">
                    <span
                      onClick={() => toggleTask(t)}
                      className={`cursor-pointer ${
                        t.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {t.text}
                    </span>

                    <button
                      onClick={() => deleteTask(t._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
            </ul>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;