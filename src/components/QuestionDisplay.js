import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../config/firebaseConfig";
import { ref, get, set } from "firebase/database";

function useRoomId() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    return params.get("roomId");
}

export default function ParticipantQuiz() {
    const roomId = useRoomId();
    const [roomExists, setRoomExists] = useState(null);
    const [participantName, setParticipantName] = useState("");
    const [joined, setJoined] = useState(false);

    // 1. Check if room exists in Firebase
    useEffect(() => {
        if (!roomId) return;
        get(ref(db, `rooms/${roomId}`)).then(snap => {
            setRoomExists(snap.exists());
        });
    }, [roomId]);

    // 2. Join the room as a participant
    const handleJoin = async () => {
        if (!participantName || !roomId) return;
        const pid = Math.random().toString(36).substr(2, 9); // Generate random ID
        await set(ref(db, `rooms/${roomId}/participants/${pid}`), {
            name: participantName,
            joined: Date.now()
        });
        setJoined(true);
    };

    // 3. UI
    if (!roomId)
        return <div style={{ padding: '40px' }}>Room ID not found in URL.<br />Please use a valid participant link.</div>;

    if (roomExists === false)
        return <div style={{ padding: '40px' }}>Room not found.<br />Please check the link or contact the quiz organizer.</div>;

    if (roomExists === null)
        return <div style={{ padding: '40px' }}>Loading room info…</div>;

    if (!joined)
        return (
            <div style={{ padding: '40px', maxWidth: 400, margin: '0 auto' }}>
                <h2>Join Quiz Room: <span style={{ color: "#4a90e2" }}>{roomId}</span></h2>
                <div>
                    <label>
                        Your Name: <br />
                        <input
                            type="text"
                            value={participantName}
                            onChange={e => setParticipantName(e.target.value)}
                            style={{ padding: "8px", fontSize: "1.2em", width: "90%", borderRadius: "6px" }}
                        />
                    </label>
                </div>
                <button
                    style={{ marginTop: "20px", padding: "10px 22px", fontSize: "1em" }}
                    onClick={handleJoin}
                    disabled={!participantName}
                >
                    Join Quiz
                </button>
            </div>
        );

    // 4. After joining, show quiz interface (replace with your quiz UI)
    return (
        <div style={{ padding: '40px' }}>
            <h2>Welcome, {participantName}!</h2>
            <div>Waiting for quiz to start…</div>
            {/* TODO: Show questions, timer, etc. based on roomId */}
        </div>
    );
}