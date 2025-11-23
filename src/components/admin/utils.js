// src/components/AdminPanel/utils.js

import React from 'react';

export function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(idx) {
    const colors = ["#1976d2", "#388e3c", "#7b1fa2", "#fbc02d", "#d32f2f", "#0097a7", "#c2185b", "#5d4037", "#0288d1", "#f57c00"];
    return colors[idx % colors.length];
}

export function getAvatar(name, idx, size = 32) {
    return (
        <span className="avatar-circle" style={{ background: getAvatarColor(idx), width: `${size}px`, height: `${size}px`, lineHeight: `${size}px`, fontSize: `${size * 0.5}px` }}>
            {getInitials(name)}
        </span>
    );
}