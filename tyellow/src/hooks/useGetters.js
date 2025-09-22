import {auth} from "../firebase/config";

export const useGetters = () => {
    const user = auth.currentUser;
    const uid = user?.uid;
    const email = user?.email;
    const photoURL = user?.photoURL;
    const displayName = user?.displayName;

    // Get Id from DB by email
    const getIDbyEmail = async (email) => {
        const [rows] = await execute('SELECT id FROM users WHERE email = ?', [email]);
        return rows[0]?.id;
    }

    return {
        user,
        uid,
        email,
        photoURL,
        displayName,
    }

}

