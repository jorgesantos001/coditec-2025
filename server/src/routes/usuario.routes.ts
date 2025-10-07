import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import UsuarioService from "../services/UsuarioService";
import UsuarioController from "../controllers/UsuarioController";
import validateRequest from "../middlewares/validateRequest";
import {
  criarUsuarioSchema,
  loginUsuarioSchema,
} from "../schemas/usuario.schema";

const prisma = new PrismaClient();
const usuarioService = new UsuarioService(prisma);
const usuarioController = new UsuarioController(usuarioService);

const usuarioRouter = Router();

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

export default usuarioRouter;
