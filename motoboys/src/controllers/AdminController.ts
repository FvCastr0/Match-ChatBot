import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { WhatsAppService } from '../services/WhatsAppService';
import { ReportService } from '../services/ReportService';
import { queuePrivateMessage } from '../jobs/queue';

export class AdminController {
  private reportService = new ReportService();

  /**
   * Retorna os motoboys confirmados na escala de hoje em tempo real
   */
  async getTodayScale(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.reportService.getTodayScale();

      if (!result) {
        return res.status(404).json({ message: 'Nenhuma escala aberta para a data de hoje.' });
      }

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retorna o relatório/métricas históricas de todos os motoboys
   */
  async getMotoboysMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await this.reportService.getMotoboysMetrics();
      return res.json(report);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Registra manualmente a presença do motoboy no turno (Check-in do Admin)
   */
  async recordCheckIn(req: Request, res: Response, next: NextFunction) {
    const { attendanceId } = req.params;
    const { compareceu } = req.body;

    try {
      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendanceId as string },
        data: {
          compareceu,
          horarioCheckIn: compareceu ? new Date() : null,
        },
        include: {
          motoboy: true,
        },
      });

      if (compareceu) {
        await queuePrivateMessage(
          updatedAttendance.motoboy.telefone,
          `Olá ${updatedAttendance.motoboy.nome}, sua presença foi confirmada para o turno de hoje! Bom trabalho! 🚀`
        );
      }

      return res.json({ message: 'Check-in atualizado com sucesso.', updatedAttendance });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Identifica participantes do grupo de WhatsApp que não estão cadastrados como motoboys ativos no sistema
   */
  async auditGroupParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const wpService = new WhatsAppService();
      const participants = await wpService.getGroupParticipants();

      if (!participants || participants.length === 0) {
        return res.json({ message: 'Nenhum participante encontrado no grupo ou grupo vazio.', nonMotoboys: [] });
      }

      const participantJids = participants.map((p: any) => {
        if (typeof p === 'string') return p;
        return p.id || p.jid;
      }).filter(Boolean);

      const motoboys = await prisma.motoboy.findMany({
        where: { ativo: true },
        select: { telefone: true, nome: true },
      });

      const motoboyTelefones = new Set(motoboys.map((m) => m.telefone));

      const nonMotoboys = participantJids
        .filter((jid: string) => !motoboyTelefones.has(jid))
        .map((jid: string) => {
          const number = jid.split('@')[0];
          return { jid, number };
        });

      return res.json({
        totalParticipants: participantJids.length,
        totalRegisteredMotoboys: motoboys.length,
        totalNonMotoboys: nonMotoboys.length,
        nonMotoboys,
      });
    } catch (error) {
      return next(error);
    }
  }
}
