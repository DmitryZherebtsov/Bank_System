
import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./form/login";
import Register from "./form/register";
import Dashboard from "./dashboard/dashboard";

const App = () => {

  const [message, setMessagge] = useState("");

  useState(() => {
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => setMessagge(data.message))
      .catch((error) => console.error("Error fetching data:", error))
  }, );

  return (
    <Router>
      <div>
          <h1>Test Messagge</h1>
          <p>{message}</p>
          <button><a href="./register">Register</a></button>
          <button><a href="./login">Login</a></button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard /> }/>
        </Routes>
      </div>
    </Router>
  )
}

export default App