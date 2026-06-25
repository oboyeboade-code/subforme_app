import { createContext, ReactNode, useContext, useState } from "react";

export type UIVersion = "editorial" | "v3";

interface UIVersionContextValue {
  version: UIVersion;
  setVersion: (v: UIVersion) => void;

  mapPath: (path: string, target: UIVersion) => string;
}

const UIVersionContext = createContext<UIVersionContextValue | null>(null);

const mapPath = (path: string, target: UIVersion): string => {
  const editorialShape = path.startsWith("/v3") ? path.slice(3) || "/" : path;
  if (target === "v3") {
    if (editorialShape === "/") return "/v3";
    return `/v3${editorialShape}`;
  }
  return editorialShape;
};

export const UIVersionProvider = ({ children }: { children: ReactNode }) => {
  const [version, setVersionState] = useState<UIVersion>("v3");

  const value: UIVersionContextValue = {
    version,
    setVersion: (v) => setVersionState(v),
    mapPath,
  };

  return <UIVersionContext.Provider value={value}>{children}</UIVersionContext.Provider>;
};

export const useUIVersion = () => {
  const ctx = useContext(UIVersionContext);
  if (!ctx) throw new Error("useUIVersion must be used within UIVersionProvider");
  return ctx;
};
