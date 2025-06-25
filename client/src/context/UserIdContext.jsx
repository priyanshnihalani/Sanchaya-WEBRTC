import { createContext, useContext, useState, useEffect } from "react";

import { getOrCreateUserId } from "../utility/getOrCreateUserId";
import { shareRoom } from "../utility/shareRoom";

const UserIdContext = createContext()

export const UserIdProvider = ({ children }) => {
    const [userId, setUserId] = useState('')
    const [userName, setUserName] = useState('')

    useEffect(() => {
        const name = shareRoom()
        const id = getOrCreateUserId()
        setUserId(id)
        setUserName(name)
    }, [])

    

    return (
        <UserIdContext.Provider value={{ userId, userName }}>
            {children}
        </UserIdContext.Provider>
    )
}

export const useUserId = () => useContext(UserIdContext);