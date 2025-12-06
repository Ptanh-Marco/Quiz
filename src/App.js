import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ParticipantQuiz from "./components/participant/ParticipantQuiz";
import AdminPanel from "./components/admin/AdminPanel";
import CreateRoom from './components/admin/Room/CreateRoom';
import NotFound from "./components/NotFound";
import AdminLogin from "./components/admin/AdminLogin";

import "./App.scss";

function ProtectedAdminPanel() {
    const [verified, setVerified] = useState(false);
    return verified ? <AdminPanel /> : <AdminLogin onSuccess={() => setVerified(true)} />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/admin/create-room" element={<CreateRoom />} />
                <Route path="/admin" element={<ProtectedAdminPanel />} />
                <Route path="/participant" element={<ParticipantQuiz />} />
                <Route path="/participant/:roomId" element={<ParticipantQuiz />} />
                <Route path="/404" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;