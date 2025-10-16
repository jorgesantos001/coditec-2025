import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import { UserContext } from "./userContext";

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

  //Pega a função setUser do UserContext
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    // Se ambos existirem, atualiza os dois contextos
    if (token && userData) {
      setAuthenticated(true);
      try {
        // Carrega os dados do usuário que estão em formato string JSON
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        // Limpa em caso de dados corrompidos
        localStorage.removeItem("userData");
      }
    }
  }, [setUser]); // setUser como dependência do useEffect

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
