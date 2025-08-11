import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dashboard, IssueModal } from "./components";

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
      <div className="text-center min-h-screen bg-gray-100">
        <header className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-10 px-5 mb-5 shadow-lg">
          <h1 className="m-0 mb-2.5 text-4xl font-semibold md:text-xl">
            Project Issue Management System
          </h1>
          <p className="m-0 text-lg opacity-90 md:text-xl">
            Manage issues and track project progress
          </p>
        </header>

        <main className="max-w-6xl mx-auto px-5 md:px-20">
          <Dashboard />
          <div className="mt-5 text-center">
            <IssueModal />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
