import React, { useState, useEffect } from "react";
import { initAdminAuthen } from "../admin/initAdminAuthen";

export default function AdminLogin({ onSuccess }) {
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState("");
    const [expectedPassword, setExpectedPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [generatedPassword, setGeneratedPassword] = useState("");

    useEffect(() => {
        async function fetchOrCreateAuthen() {
            try {
                const { password, generated } = await initAdminAuthen();
                setExpectedPassword(password);
                if (generated) setGeneratedPassword(password);
            } catch (err) {
                setError("Failed to fetch or create admin password.");
            } finally {
                setLoading(false);
            }
        }
        fetchOrCreateAuthen();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === expectedPassword) {
            setError("");
            onSuccess();
        } else {
            setError("Incorrect password!");
        }
    };

    if (loading) return <div className="admin-login-container">Loading...</div>;

    return (
        <div className="admin-login-container">
            <form className="admin-login-form" onSubmit={handleSubmit}>
                <h2>Admin Access</h2>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    className="admin-password-input"
                />
                <button type="submit" className="admin-login-btn">Login</button>
                {error && <div className="admin-login-error">{error}</div>}
                {generatedPassword && (
                    <div className="admin-login-hint">
                        <strong>First time setup:</strong> Your new admin password is <code>{generatedPassword}</code>
                    </div>
                )}
            </form>
        </div>
    );
}