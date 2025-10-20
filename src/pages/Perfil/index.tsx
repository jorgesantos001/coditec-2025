import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/userContext';
import api from '../../services/api';
import { Navbar } from '../../components/Navbar';
import './perfil.scss';

interface PerfilData {
  nm_usuario: string;
  cd_email_usuario: string;
  cd_foto_usuario?: string;
  nr_celular_usuario?: string;
  sg_estado_usuario?: string;
  nm_cidade_usuario?: string;
  dt_nascimento_usuario?: string;
}

const Perfil: React.FC = () => {
  const { user } = useContext(UserContext);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<PerfilData>({
    nm_usuario: '',
    cd_email_usuario: '',
    cd_foto_usuario: '',
    nr_celular_usuario: '',
    sg_estado_usuario: '',
    nm_cidade_usuario: '',
  });
  const [fotoPreview, setFotoPreview] = useState<string>('');

  useEffect(() => {
    // Buscar dados do perfil do usuário
    async function fetchPerfil() {
      if (user && user.id) {
  const res = await api.get(`/api/usuario/${user.id}`);
        setPerfil(res.data);
        setForm(res.data);
        setFotoPreview(res.data.cd_foto_usuario || '');
      }
    }
    fetchPerfil();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoPreview(URL.createObjectURL(file));
      setForm({ ...form, cd_foto_usuario: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Salvar alterações do perfil
    await api.put(`/usuario/${user.id}`, form);
    setEditando(false);
  };

  if (!perfil) return <div>Carregando...</div>;
  return (
    <div>
      <Navbar page="perfil" />
      <div className="perfil-container">
        <h2>Meu Perfil</h2>
        <div className="perfil-grid">
          <div className="perfil-foto">
            {fotoPreview && fotoPreview !== 'default.png' ? (
              <img src={fotoPreview} alt="Foto de perfil" />
            ) : (
              <div style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#1976d2',
                fontWeight: 700
              }}>
                {form.nm_usuario ? form.nm_usuario.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
              </div>
            )}
            {editando && (
              <input type="file" name="cd_foto_usuario" accept="image/*" onChange={handleFotoChange} />
            )}
          </div>
          <form onSubmit={handleSubmit} className="perfil-form">
            <label>Nome:
              <input
                type="text"
                name="nm_usuario"
                value={form.nm_usuario}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
            <label>Email:
              <input
                type="email"
                name="cd_email_usuario"
                value={form.cd_email_usuario}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
            <label>Celular:
              <input
                type="tel"
                name="nr_celular_usuario"
                value={form.nr_celular_usuario || ''}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
            <label>Estado:
              <input
                type="text"
                name="sg_estado_usuario"
                value={form.sg_estado_usuario || ''}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
            <label>Cidade:
              <input
                type="text"
                name="nm_cidade_usuario"
                value={form.nm_cidade_usuario || ''}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
            <label>Data de nascimento:
              <input
                type="date"
                name="dt_nascimento_usuario"
                value={form.dt_nascimento_usuario ? form.dt_nascimento_usuario.substring(0,10) : ''}
                onChange={handleChange}
                disabled={!editando}
              />
            </label>
          </form>
        </div>
        <div className="perfil-botao">
          {editando ? (
            <button type="submit" form="perfil-form">Salvar</button>
          ) : (
            <button type="button" onClick={() => setEditando(true)}>Editar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;