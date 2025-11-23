// src/components/AdminPanel/ParticipantList.jsx

import React from 'react';
import { FaUsers } from 'react-icons/fa';
import { getAvatar } from './utils'; // We'll create a utils file

const ParticipantList = ({ participants }) => {
    return (
        <section className="admin-card admin-waiting-section">
            <h2><FaUsers style={{ marginRight: 6 }} /> Participants Waiting ({participants.length})</h2>
            {participants.length > 0 ? (
                <table className="admin-table">
                    <thead><tr><th>Avatar</th><th>Name</th><th>Joined</th></tr></thead>
                    <tbody>
                        {participants.map((p, idx) => (
                            <tr key={p.id}>
                                <td>{getAvatar(p.name, idx)}</td>
                                <td>{p.name}</td>
                                <td>{new Date(p.joined).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Waiting for participants to join...</p>
            )}
        </section>
    );
};

export default ParticipantList;