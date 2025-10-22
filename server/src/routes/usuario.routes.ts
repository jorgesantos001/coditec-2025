import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import UsuarioService from "../services/UsuarioService";
import UsuarioController from "../controllers/UsuarioController";
import validateRequest from "../middlewares/validateRequest";
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  loginUsuarioSchema,
} from "../schemas/usuario.schema";
import authMiddleware from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const usuarioService = new UsuarioService(prisma);
const usuarioController = new UsuarioController(usuarioService);

const usuarioRouter = Router();

usuarioRouter.get(
  "/usuario/nome/:id",
  authMiddleware,
  usuarioController.getUserNameById
);

usuarioRouter.patch(
  "/usuario/:id",
  authMiddleware,
  validateRequest(atualizarUsuarioSchema),
  usuarioController.updateUser
);

usuarioRouter.post(
  "/usuarioCadastro",
  validateRequest(criarUsuarioSchema),
  usuarioController.create
);

usuarioRouter.post(
  "/usuarioLogin",
  validateRequest(loginUsuarioSchema),
  usuarioController.login
);

usuarioRouter.get("/usuarios", authMiddleware, usuarioController.getUsers);

usuarioRouter.get("/perfil", authMiddleware, usuarioController.getProfile);

// Retorna dados completos do usuário pelo id
usuarioRouter.get("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id obrigatório" });
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({ error: "id inválido" });
  }
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    const { cd_senha_usuario, ...usuarioSemSenha } = usuario;
    return res.status(200).json(usuarioSemSenha);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

export default usuarioRouter;
