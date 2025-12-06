import React, { useState } from "react";
import { db } from "../../../config/firebaseConfig";
import { ref, set } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";

function generateRoomId(length = 7) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function CreateRoom() {
    const [roomId, setRoomId] = useState("");
    const [created, setCreated] = useState(false);

    const handleCreateRoom = async () => {
        const newRoomId = generateRoomId();
        setRoomId(newRoomId);

        // Save to Firebase for room tracking
        await set(ref(db, `rooms/${newRoomId}`), {
            created: Date.now(),
            status: "waiting"
        });

        setCreated(true);
    };

    const participantURL = `${window.location.origin}/#/participant?roomId=${roomId}`;

    return (
        <div className="admin-card" style={{ maxWidth: 500, margin: "40px auto", padding: 32 }}>
            <h2>Create a Quiz Room</h2>
            {!created ? (
                <button className="admin-btn" onClick={handleCreateRoom}>Generate Room</button>
            ) : (
                <>
                    <div style={{ margin: "16px 0 8px" }}>
                        <b>Room ID:</b> <span style={{ fontSize: "1.3em", color: "#4a90e2" }}>{roomId}</span>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <b>Participant URL:</b> <br />
                        <a href={participantURL} target="_blank" rel="noopener noreferrer">{participantURL}</a>
                        <button style={{ marginLeft: 8 }}
                            onClick={() => { navigator.clipboard.writeText(participantURL); alert("Copied!"); }}
                        >Copy URL</button>
                    </div>
                    <div style={{ textAlign: "center", margin: "20px 0" }}>
                            <QRCodeSVG  value={participantURL} size={180} />
                    </div>
                    <small>Scan this QR code to join as a participant.</small>
                </>
            )}
        </div>
    );
}