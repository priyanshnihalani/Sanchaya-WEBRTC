import { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateUserId } from "../utility/getOrCreateUserId";
import { shareRoom } from "../utility/shareRoom";

const UserIdContext = createContext();

export const UserIdProvider = ({ children }) => {

  const [userId, setUserId] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const id = getOrCreateUserId();
    const roomName = shareRoom();

    setUserId(id);
    setRoom(roomName);

  }, []);

  return (
    <UserIdContext.Provider value={{ userId, room }}>
      {children}
    </UserIdContext.Provider>
  );
};

export const useUserId = () => useContext(UserIdContext);