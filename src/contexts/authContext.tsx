import { createContext, ReactNode, useState, useEffect } from "react"; // importe useEffect

type Props = {
  children?: ReactNode;
};

type IAuthContext = {
  authenticated: boolean;
  setAuthenticated: (newState: boolean) => void;
};

const initialValue = {
  authenticated: false,
  setAuthenticated: () => {},
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: any) => {
  const [authenticated, setAuthenticated] = useState(
    initialValue.authenticated
  );

  // Verifica se existe um token no localStorage ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
