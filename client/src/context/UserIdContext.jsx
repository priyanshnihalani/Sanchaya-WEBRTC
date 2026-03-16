import { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateUserId } from "../utility/getOrCreateUserId";
import { getOrCreateUserName } from "../utility/shareRoom";

const UserIdContext = createContext();

export const UserIdProvider = ({ children }) => {

    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);

    useEffect(() => {

        const id = getOrCreateUserId();
        const name = getOrCreateUserName();

        setUserId(id);
        setUserName(name);

    }, []);

    return (
        <UserIdContext.Provider value={{ userId, userName }}>
            {children}
        </UserIdContext.Provider>
    );
};

export const useUserId = () => useContext(UserIdContext);