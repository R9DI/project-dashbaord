import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import IssueModal from "./components/IssueModal.jsx";
import Dashboard from "./components/Dashboard.jsx";
import "./App.css";

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
