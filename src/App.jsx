import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "@/components/pages/ChatPage";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;