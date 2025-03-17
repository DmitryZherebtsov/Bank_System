

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./form/login";
import Register from "./form/register";
import Dashboard from "./dashboard/dashboard";
import Sidebar from "./sidebar/sidebar";
import Atm from "./atm/atm";


import './index.css'

const App = () => {


  return (
    <div className="main">
      <Router>


        <Sidebar />


        <Routes>

          <Route path="/" element={<Login /> }/>

          <Route path="/register" element={<Register /> }/>

          <Route path="/dashboard" element={<Dashboard /> } />

          <Route path="/atm" element={<Atm /> } />

        </Routes>


      </Router>
    </div>

  )
}

export default App