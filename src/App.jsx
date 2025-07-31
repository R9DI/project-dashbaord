import React from "react";
import IssueModal from "./components/IssueModal.jsx";
import Dashboard from "./components/Dashboard.jsx";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>프로젝트 이슈 관리 시스템</h1>
        <p>이슈를 관리하고 프로젝트 진행 상황을 추적하세요</p>
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
