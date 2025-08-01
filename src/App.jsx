import React from "react";
import IssueModal from "./components/IssueModal.jsx";
import Dashboard from "./components/Dashboard.jsx";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Issue Management System</h1>
        <p>Manage issues and track project progress</p>
        <p>안녕</p>
      </header>

      <main style={{ padding: "20px" }}>
        <Dashboard />
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <IssueModal />
        </div>
      </main>
    </div>
  );
}

export default App;
