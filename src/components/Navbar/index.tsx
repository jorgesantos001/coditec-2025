import React, { useContext, useState } from "react";
// 1. Importe o useNavigate para fazer o redirecionamento
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/userContext";
import { AuthContext } from "../../contexts/authContext";

interface HeaderProps {
  page?: string;
}

export const Navbar: React.FC<HeaderProps> = ({ page }) => {
  const [toggledMenu, setToggledMenu] = useState(false);

  // 2. Destruture os valores e setters dos contextos para facilitar o uso
  const { user, setUser } = useContext(UserContext);
  const { authenticated, setAuthenticated } = useContext(AuthContext);

  // 3. Inicialize o hook de navegação
  const navigate = useNavigate();

  const handleToggleMenu = () => {
    setToggledMenu(!toggledMenu);
  };

  // 4. Atualize a função de logout com a lógica completa
  const handleLogout = () => {
    // Limpa o armazenamento local
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Reseta o estado global da aplicação
    setAuthenticated(false);
    setUser(null as any);

    // Redireciona para a página de login
    navigate("/login");
  };

  return (
    <header>
      <nav className="nav-bar">
        <Link to="/" className="nav-logo">
          <img
            src="/assets/img/logos/logo-nacao-nutrida-white.svg"
            className="logo"
            alt="Logo Nação Nutrida"
          />
        </Link>
        <div className={`nav-menu ${toggledMenu ? "toggled" : ""}`}>
          {authenticated ? ( // 5. Simplificado para usar a variável booleana diretamente
            <>
              <ul className="row nav-list">
                <>
                  <Link to="/descobrir" className="nav-link">
                    <li>Descobrir</li>
                  </Link>
                  <Link to="/campanhas/criar" className="nav-link">
                    <li>Criar</li>
                  </Link>
                  <Link to="#" className="nav-link">
                    <li>Painel</li>
                  </Link>
                </>
              </ul>
              <div className="row nav-profile" onClick={handleToggleMenu}>
                <div className="img-wrapper">
                  <img
                    // Adicionado uma verificação para o caso do usuário ser nulo temporariamente
                    key={`${user?.cd_foto_usuario}`}
                    src={`/assets/profile/${user?.cd_foto_usuario}`}
                    className="img-profile"
                    alt="Foto de perfil"
                  />
                </div>
                <img
                  className="seta"
                  src="/assets/img/arrow-down.svg"
                  alt="Icone de seta"
                />
              </div>
              <div className="toggle-menu header">
                <ul>
                  <>
                    <li className="toggle-link">
                      <Link to="#" className="sub titulo">
                        Notificações
                      </Link>
                    </li>
                    <li className="toggle-link">
                      <Link to="/chat" className="sub titulo">
                        Chat
                      </Link>
                    </li>
                    <li className="toggle-link">
                      <Link to="/perfil" className="sub titulo">
                        Meus dados
                      </Link>
                    </li>
                  </>
                  <li className="toggle-link logout">
                    {/* 6. Removido o 'to' do Link e usando apenas o onClick.
                           O redirecionamento agora é feito pela função handleLogout. */}
                    <div
                      onClick={handleLogout}
                      className="sub titulo logout-button"
                    >
                      Logout
                      <img src="/assets/img/icone_logout.svg" alt="Logout" />
                    </div>
                  </li>
                </ul>
              </div>
            </>
          ) : page === "Login" ? (
            <>
              <p className="nav-link">
                Não tem conta?
                <Link to="/cadastro" className="nav-link titulo-link">
                  Cadastrar-se
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="nav-link">
                Já tem conta?
                <Link to="/login" className="nav-link titulo-link">
                  Faça o login
                </Link>
              </p>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
