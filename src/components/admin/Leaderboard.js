// src/components/AdminPanel/Leaderboard.jsx

import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getAvatar } from './utils';

const Leaderboard = ({ leaderboard, finished }) => {
    return (
        <section className={`admin-card admin-leaderboard-section ${finished ? "leaderboard-results" : ""}`}>
            <h2><FaTrophy style={{ marginRight: 6 }} /> {finished ? "Final Leaderboard" : "Live Leaderboard"}</h2>
            {finished && leaderboard.length > 0 && (
                <div className="podium-wrapper">
                    <div className="podium">
                        {leaderboard[1] && <div className="podium-col podium-silver"><div className="podium-medal">🥈</div><div className="podium-avatar">{getAvatar(leaderboard[1].name, 1, 50)}</div><div className="podium-name">{leaderboard[1].name}</div><div className="podium-points">{leaderboard[1].points} pts</div></div>}
                        {leaderboard[0] && <div className="podium-col podium-gold"><div className="podium-medal">🥇</div><div className="podium-avatar">{getAvatar(leaderboard[0].name, 0, 60)}</div><div className="podium-name">{leaderboard[0].name}</div><div className="podium-points">{leaderboard[0].points} pts</div></div>}
                        {leaderboard[2] && <div className="podium-col podium-bronze"><div className="podium-medal">🥉</div><div className="podium-avatar">{getAvatar(leaderboard[2].name, 2, 50)}</div><div className="podium-name">{leaderboard[2].name}</div><div className="podium-points">{leaderboard[2].points} pts</div></div>}
                    </div>
                </div>
            )}
            {leaderboard.length > 0 ? (
                <table className="admin-table leaderboard-table">
                    <thead><tr><th>Rank</th><th>Avatar</th><th>Name</th><th>Points</th></tr></thead>
                    <tbody>
                        {leaderboard.slice(finished ? 3 : 0).map((row, idx) => {
                            const rank = (finished ? 4 : 1) + idx;
                            return (<tr key={row.pid}><td>{rank}</td><td>{getAvatar(row.name, rank - 1)}</td><td>{row.name}</td><td>{row.points}</td></tr>);
                        })}
                    </tbody>
                </table>
            ) : (
                <div>No scores yet.</div>
            )}
        </section>
    );
};

export default Leaderboard;