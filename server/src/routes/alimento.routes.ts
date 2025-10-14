import { PrismaClient } from "@prisma/client";
import AlimentoService from "../services/AlimentoService";
import { Router } from "express";
import AlimentoController from "../controllers/AlimentoController";

const prisma = new PrismaClient();
const alimentoService = new AlimentoService(prisma);
const alimentoController = new AlimentoController(alimentoService);

const alimentoRouter = Router();

alimentoRouter.get("/alimentos", alimentoController.buscarAlimentosPorTipo);

alimentoRouter.get(
  "/alimentosDoados",
  alimentoController.buscarTodosAlimentosDoados
);

export default alimentoRouter;
