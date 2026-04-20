import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Dashboard() {

  if (!localStorage.getItem("token")) {
    window.location.href = "/";
  }

  const [task, setTask] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [dark, setDark] = useState(true);

  const API = "https://productivity-backend-ccxh.onrender.com";

  useEffect(() => {
    fetch(`${API}/api/tasks`, {
      headers: { Authorization: localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => setTaskList(data));
  }, []);

  const addTask = () => {
    if (!task) return;

    fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({ text: task })
    })
      .then(res => res.json())
      .then(newTask => setTaskList([...taskList, newTask]));

    setTask("");
  };

  const deleteTask = (id) => {
    fetch(`${API}/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: localStorage.getItem("token") }
    }).then(() => {
      setTaskList(taskList.filter(t => t._id !== id));
    });
  };

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
      .then(updated =>
        setTaskList(taskList.map(t => t._id === updated._id ? updated : t))
      );
  };

  return (
    <div className={dark ? "bg-black text-white" : "bg-gray-100 text-black"}>

      {/* Navbar */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">🚀 StudoLife</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 border rounded"
          >
            {dark ? "Light" : "Dark"}
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">

        {/* Greeting */}
        <h2 className="text-2xl mb-4">
          Welcome, {localStorage.getItem("email")}
        </h2>

        {/* Add Task */}
        <div className="mb-6">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add new task..."
            className="w-full p-3 border rounded mb-2"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {taskList.map((t) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded shadow flex justify-between ${
                dark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <span
                onClick={() => toggleTask(t)}
                className={`cursor-pointer ${
                  t.completed ? "line-through opacity-50" : ""
                }`}
              >
                {t.text}
              </span>

              <button onClick={() => deleteTask(t._id)}>
                ❌
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;