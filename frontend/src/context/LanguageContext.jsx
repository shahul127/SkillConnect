import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("skillconnect-language") || "en"
  );

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("skillconnect-language", newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}