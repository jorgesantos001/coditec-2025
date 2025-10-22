import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import validateRequest from "../middlewares/validateRequest";
import { criarCampanhaSchema } from "../schemas/campanha.schema";
import CampanhaService from "../services/CampanhaService";
import CampanhaController from "../controllers/CampanhaController";
import authMiddleware from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const campanhaService = new CampanhaService(prisma);
const campanhaController = new CampanhaController(campanhaService);

const campanhaRouter = Router();

campanhaRouter.post(
  "/campanhas",
  authMiddleware,
  validateRequest(criarCampanhaSchema),
  campanhaController.create
);

campanhaRouter.get("/campanhas", campanhaController.getAll);

campanhaRouter.get("/campanhas/buscar", campanhaController.findByLocation);

campanhaRouter.get("/campanhas/:id", campanhaController.getById);

// Retorna campanhas de um usuário específico
campanhaRouter.get("/campanhas/usuario/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id obrigatório" });
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({ error: "id inválido" });
  }
  try {
    const campanhas = await prisma.campanha.findMany({ where: { usuario_id: id } });
    return res.status(200).json(campanhas);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar campanhas do usuário" });
  }
});

export default campanhaRouter;
