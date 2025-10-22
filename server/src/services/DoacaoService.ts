import { PrismaClient } from "@prisma/client";
import { RegistrarDoacaoDTO } from "../schemas/doacao.schema";

export default class DoacaoService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Registra uma nova doação de múltiplos alimentos para uma campanha.
   */
  public async registrarDoacao(dados: RegistrarDoacaoDTO) {
    const { infos_doacao, alimentos_doacao } = dados;

    const dadosParaInserir = alimentos_doacao.map((alimento) => ({
      usuario_id: infos_doacao.usuario_doacao,
      campanha_id: infos_doacao.cd_campanha_doacao,
      alimento_id: alimento.alimento_id,
      qt_alimento_doado: alimento.qt_alimento_doacao,
    }));

    const resultado = await this.prisma.alimento_doacao.createMany({
      data: dadosParaInserir,
    });

    return resultado;
  }
  /**
   * Busca todas as doações feitas por um usuário, incluindo dados da campanha e alimentos doados.
   */
  public async buscarDoacoesPorUsuario(usuarioId: string) {
    // Busca todas as doações do usuário
    const doacoes = await this.prisma.alimento_doacao.findMany({
      where: { usuario_id: usuarioId },
    });

    // Agrupa por campanha e monta estrutura esperada
    const campanhasMap: { [campanhaId: string]: any } = {};
    for (const doacao of doacoes) {
      if (!campanhasMap[doacao.campanha_id]) {
        // Busca dados da campanha
        const campanha = await this.prisma.campanha.findUnique({ where: { id: doacao.campanha_id } });
        // Busca alimentos já adicionados
        campanhasMap[doacao.campanha_id] = {
          id: doacao.campanha_id,
          campanha,
          alimentos: [],
        };
      }
      // Busca nome do alimento
      const alimento = await this.prisma.alimento.findUnique({ where: { id: doacao.alimento_id } });
      campanhasMap[doacao.campanha_id].alimentos.push({
        nm_alimento: alimento?.nm_alimento || "",
        qt_alimento_doacao: doacao.qt_alimento_doado,
      });
    }
    // Retorna array de doações agrupadas por campanha
    return Object.values(campanhasMap);
  }
}
