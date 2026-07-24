import { prisma } from '../prisma';

export class ReportService {
  /**
   * Obtém a escala de hoje com os motoboys confirmados e ordem de chegada
   */
  async getTodayScale() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = await prisma.schedule.findFirst({
      where: { data: today },
      include: {
        alocados: {
          include: {
            motoboy: {
              select: {
                id: true,
                nome: true,
                telefone: true,
              },
            },
          },
          orderBy: {
            confirmadoAs: 'asc',
          },
        },
      },
    });

    if (!schedule) {
      return null;
    }

    return {
      id: schedule.id,
      data: schedule.data,
      vagasTotais: schedule.vagasTotais,
      vagasPreenchidas: schedule.vagasPreenchidas,
      status: schedule.status,
      confirmados: schedule.alocados.map((att) => ({
        attendanceId: att.id,
        motoboyId: att.motoboy.id,
        nome: att.motoboy.nome,
        telefone: att.motoboy.telefone,
        confirmadoAs: att.confirmadoAs,
        compareceu: att.compareceu,
      })),
    };
  }

  /**
   * Calcula métricas agregadas de presença dos motoboys otimizando a projeção de campos
   */
  async getMotoboysMetrics() {
    const motoboys = await prisma.motoboy.findMany({
      select: {
        id: true,
        nome: true,
        telefone: true,
        ativo: true,
        presencas: {
          select: {
            id: true,
            schedule: {
              select: {
                data: true,
              },
            },
          },
        },
      },
    });

    const nomesDias = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

    return motoboys.map((motoboy) => {
      const totalTurnos = motoboy.presencas.length;

      const diasSemanaCount: Record<string, number> = {
        Domingo: 0,
        Segunda: 0,
        Terca: 0,
        Quarta: 0,
        Quinta: 0,
        Sexta: 0,
        Sabado: 0,
      };

      motoboy.presencas.forEach((p) => {
        if (p.schedule?.data) {
          const diaIndex = new Date(p.schedule.data).getDay();
          const diaNome = nomesDias[diaIndex];
          diasSemanaCount[diaNome] = (diasSemanaCount[diaNome] || 0) + 1;
        }
      });

      let diaMaisFrequente = 'Nenhum';
      let maxPresencas = 0;
      Object.entries(diasSemanaCount).forEach(([dia, count]) => {
        if (count > maxPresencas) {
          maxPresencas = count;
          diaMaisFrequente = dia;
        }
      });

      return {
        id: motoboy.id,
        nome: motoboy.nome,
        telefone: motoboy.telefone,
        ativo: motoboy.ativo,
        totalTurnosRealizados: totalTurnos,
        diaMaisFrequente,
        diasSemanaDetalhados: diasSemanaCount,
      };
    });
  }
}
