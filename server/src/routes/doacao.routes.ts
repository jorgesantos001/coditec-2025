import { PrismaClient } from "@prisma/client";
import DoacaoService from "../services/DoacaoService";
import DoacaoController from "../controllers/DoacaoController";
import { Router } from "express";

const prisma = new PrismaClient();
const doacaoService = new DoacaoService(prisma);
const doacaoController = new DoacaoController(doacaoService);

const doacaoRouter = Router();

doacaoRouter.post("/doacoes", doacaoController.create);

export default doacaoRouter;
