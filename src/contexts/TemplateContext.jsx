import React, { createContext, useContext, useState, useEffect } from "react";

const TemplateContext = createContext();

export function TemplateProvider({ children }) {
  const [template, setTemplate] = useState(() => {
    const saved = localStorage.getItem("bookletku-template");
    return saved || "blue";
  });

  useEffect(() => {
    localStorage.setItem("bookletku-template", template);
  }, [template]);

  const value = {
    template,
    setTemplate,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}

export default TemplateContext;
