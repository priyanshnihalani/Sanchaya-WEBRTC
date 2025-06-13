import { createContext, useContext, useState } from "react";

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [droppedFiles, setDroppedFiles] = useState([]);
  return (
    <FileContext.Provider value={{ droppedFiles, setDroppedFiles }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => useContext(FileContext);
