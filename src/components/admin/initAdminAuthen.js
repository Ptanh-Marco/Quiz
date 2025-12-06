import { getDatabase, ref, get, set } from "firebase/database";

function generateRandomPassword(length = 8) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < length; ++i) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Only one record for 'authen'
export async function initAdminAuthen() {
    const db = getDatabase();
    const authenRef = ref(db, "authen");
    const snap = await get(authenRef);

    if (snap.exists() && snap.val().password) {
        // Password exists
        return { password: snap.val().password, generated: false };
    } else {
        // No password, create one
        const password = generateRandomPassword(8);
        await set(authenRef, { password });
        return { password, generated: true };
    }
}