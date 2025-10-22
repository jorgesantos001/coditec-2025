import { Request, Response } from "express";
import DoacaoService from "../services/DoacaoService";

export default class DoacaoController {
  private doacaoService: DoacaoService;

  constructor(doacaoService: DoacaoService) {
    this.doacaoService = doacaoService;
    this.create = this.create.bind(this);
    this.getByUsuario = this.getByUsuario.bind(this);
  }
  public async getByUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const doacoes = await this.doacaoService.buscarDoacoesPorUsuario(id);
      return res.status(200).json(doacoes);
    } catch (error: any) {
      console.error("Erro ao buscar doações do usuário:", error);
      return res.status(500).json({ message: "Erro interno ao buscar doações do usuário." });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const resultado = await this.doacaoService.registrarDoacao(req.body);
      return res.status(201).json({ insertedCount: resultado.count });
    } catch (error: any) {
      console.error("Erro ao processar doação:", error);
      return res
        .status(500)
        .json({ message: "Erro interno ao processar doação." });
    }
  }
}
