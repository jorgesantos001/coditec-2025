import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/userContext';
import api from '../../services/api';
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
  const { user, setUser } = useContext(UserContext);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [form, setForm] = useState<PerfilData>({
  nm_usuario: '',
  cd_email_usuario: '',
  cd_foto_usuario: undefined,
  nr_celular_usuario: '',
  sg_estado_usuario: '',
  nm_cidade_usuario: '',
    dt_nascimento_usuario: '',
  });

  const [fotoPreview, setFotoPreview] = useState<string | undefined>(undefined);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    api.get('/api/perfil').then(res => {
      setPerfil(res.data);
      setForm(res.data);
      setFotoPreview(res.data.cd_foto_usuario ? `/assets/profile/${res.data.cd_foto_usuario}` : undefined);
    });
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, cd_foto_usuario: file.name });
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    const res = await api.put('/api/perfil', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setPerfil(res.data);
    setEditando(false);
    setUser && setUser(res.data);
  };

  if (!perfil) return <div>Carregando...</div>;
  return (
    <div className="perfil-container">
      <h2>Meu Perfil</h2>
      <div className="perfil-grid">
        <div className="perfil-foto">
          <img src={fotoPreview || '/assets/profile/default.png'} alt="Foto de perfil" />
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
  );
};

export default Perfil;