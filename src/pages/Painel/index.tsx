import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "./painel.scss";

interface Campanha {
  id: string;
  nm_titulo_campanha: string;
  ds_acao_campanha: string;
  cd_imagem_campanha: string;
  alimentos: { nm_alimento: string }[];
}

interface Doacao {
  id: string;
  campanha: Campanha;
  alimentos: { nm_alimento: string; qt_alimento_doacao: number }[];
}

const Painel: React.FC = () => {
  const [aba, setAba] = useState<'campanhas' | 'doacoes'>("campanhas");
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Buscar se é admin
    api.get(`/api/usuario/${userId}`).then(res => setIsAdmin(res.data.fg_admin === 1));
    // Buscar campanhas
    api.get(isAdmin ? "/api/campanhas" : `/api/campanhas/usuario/${userId}`)
      .then(res => setCampanhas(res.data));
    // Buscar doações
    api.get(`/api/doacoes/usuario/${userId}`)
      .then(res => setDoacoes(res.data));
  }, [userId, isAdmin]);

  return (
    <>
      <Navbar page="painel" />
      <main className="painel-main">
        <div className="painel-container">
          <h1>Painel</h1>
          <div className="painel-abas">
            <button className={aba === "campanhas" ? "active" : ""} onClick={() => setAba("campanhas")}>Minhas campanhas</button>
            <button className={aba === "doacoes" ? "active" : ""} onClick={() => setAba("doacoes")}>Minhas doações</button>
          </div>
          {aba === "campanhas" ? (
            <div className="painel-cards">
              {campanhas.length === 0 ? <p>Nenhuma campanha encontrada.</p> : campanhas.map(camp => (
                <div className="painel-card" key={camp.id}>
                  <img src={`/assets/campanhas/${camp.cd_imagem_campanha}`} alt={camp.nm_titulo_campanha} />
                  <h3>{camp.nm_titulo_campanha}</h3>
                  <p>{camp.ds_acao_campanha}</p>
                  <p><strong>Alimentos:</strong> {camp.alimentos.map(a => a.nm_alimento).join(", ")}</p>
                  <button>Gerenciar campanha</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="painel-cards">
            {doacoes.length === 0 ? <p>Nenhuma doação encontrada.</p> : doacoes.map(doa => (
              <div className="painel-card" key={doa.id}>
                <img src={`/assets/campanhas/${doa.campanha.cd_imagem_campanha}`} alt={doa.campanha.nm_titulo_campanha} />
                <h3>{doa.campanha.nm_titulo_campanha}</h3>
                <p><strong>Alimentos doados:</strong> {doa.alimentos.map(a => `${a.nm_alimento} (${a.qt_alimento_doacao})`).join(", ")}</p>
                <button>Ver detalhes</button>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Painel;
