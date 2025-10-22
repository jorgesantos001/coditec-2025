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
   * Busca todas as doações do usuário logado, agregando dados relacionados e soma os alimentos doados por ele para X campanha.
   */
  public async buscarPorUserId(userId: string) {
    // 1. Buscar todas as doações do usuário
    const doacoes = await this.prisma.alimento_doacao.findMany({
      where: {
        usuario_id: userId,
      },
    });

    if (doacoes.length === 0) {
      return []; // Usuário não tem doações, retorna array vazio
    }

    // 2. Coletar os IDs únicos
    // Usamos Set para garantir que cada ID seja listado apenas uma vez
    const campanhaIds = [...new Set(doacoes.map((d) => d.campanha_id))];
    const alimentoIds = [...new Set(doacoes.map((d) => d.alimento_id))];

    // 3. Buscar os dados relacionados em lote (batch)
    const [campanhas, alimentos] = await Promise.all([
      // Busca todas as campanhas de uma vez
      this.prisma.campanha.findMany({
        where: {
          id: { in: campanhaIds },
        },
        select: {
          id: true,
          nm_titulo_campanha: true,
          nm_cidade_campanha: true,
          sg_estado_campanha: true,
        },
      }),
      // Busca todos os alimentos de uma vez
      this.prisma.alimento.findMany({
        where: {
          id: { in: alimentoIds },
        },
        select: {
          id: true,
          nm_alimento: true,
        },
      }),
    ]);

    // 4. Criar "Mapas" para facilitar a busca (melhor performance que find())
    const campanhaMap = new Map(campanhas.map((c) => [c.id, c]));
    const alimentoMap = new Map(alimentos.map((a) => [a.id, a]));

    // 5. Combinar e agregar os dados (LÓGICA ATUALIZADA)

    // Map principal: agrupa por campanha
    // Chave: campanha.id
    // Valor: { campanha: {...}, alimentos_map: Map<alimento_id, { alimento: {...}, quantidade: number }> }
    const aggregatedByCampanha = new Map();

    for (const doacao of doacoes) {
      const campanha = campanhaMap.get(doacao.campanha_id);
      const alimento = alimentoMap.get(doacao.alimento_id);

      if (!campanha || !alimento) {
        continue;
      }

      // Se a campanha ainda não está no nosso mapa de agregação, adicione-a
      if (!aggregatedByCampanha.has(campanha.id)) {
        aggregatedByCampanha.set(campanha.id, {
          campanha: {
            id: campanha.id,
            nome: campanha.nm_titulo_campanha,
            cidade: campanha.nm_cidade_campanha,
            estado: campanha.sg_estado_campanha,
          },
          // Este é o Map aninhado, para agrupar por alimento DENTRO da campanha
          alimentos_map: new Map(),
        });
      }

      // Pegue o objeto agregado da campanha atual
      const campanhaAgregada = aggregatedByCampanha.get(campanha.id);

      // Verifique se já temos uma entrada para ESTE ALIMENTO nesta campanha
      if (!campanhaAgregada.alimentos_map.has(alimento.id)) {
        // Se não, crie a entrada do alimento com a quantidade inicial 0
        campanhaAgregada.alimentos_map.set(alimento.id, {
          alimento: {
            id: alimento.id,
            nome: alimento.nm_alimento,
          },
          quantidade: 0,
        });
      }

      // Agora, puxe a entrada do alimento e SOME a quantidade da doação atual
      const alimentoAgregado = campanhaAgregada.alimentos_map.get(alimento.id);
      alimentoAgregado.quantidade += doacao.qt_alimento_doado;
    }

    // 6. Formatar o resultado final (LÓGICA ATUALIZADA)
    // Precisamos transformar os 'alimentos_map' internos em arrays 'alimentos_doados'

    const resultadoFinal = [];

    for (const campanhaAgregada of aggregatedByCampanha.values()) {
      resultadoFinal.push({
        campanha: campanhaAgregada.campanha,
        // Converte o Map<alimento_id, { ... }> em um array [ { ... }, { ... } ]
        alimentos_doados: Array.from(campanhaAgregada.alimentos_map.values()),
      });
    }

    return resultadoFinal;
  }
}
