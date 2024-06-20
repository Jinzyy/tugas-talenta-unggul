import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Employee from "./pages/Employee";
import Transaction from "./pages/Transaction";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/transaction" element={<Transaction />} />
      </Routes>
    </Router>
  );
};

export default App;
