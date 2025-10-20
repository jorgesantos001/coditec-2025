
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import UsuarioService from "../services/UsuarioService";
import UsuarioController from "../controllers/UsuarioController";
import validateRequest from "../middlewares/validateRequest";
import {
  criarUsuarioSchema,
  loginUsuarioSchema,
} from "../schemas/usuario.schema";
import authMiddleware from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const usuarioService = new UsuarioService(prisma);
const usuarioController = new UsuarioController(usuarioService);

const usuarioRouter = Router();

// Rota para buscar usuário por id
usuarioRouter.get("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await usuarioService['prisma'].usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const { cd_senha_usuario, ...usuarioSemSenha } = usuario;
    return res.status(200).json(usuarioSemSenha);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

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

export default usuarioRouter;
