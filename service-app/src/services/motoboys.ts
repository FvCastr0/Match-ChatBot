const MOTOBOYS_API_URL = "http://localhost:3003";
const MOTOBOYS_ADMIN_TOKEN = "token_secreto_super_seguro_da_match";

export interface TodayScale {
  id: string;
  data: string;
  vagasTotais: number;
  vagasPreenchidas: number;
  status: string;
  confirmados: {
    attendanceId: string;
    motoboyId: string;
    nome: string;
    telefone: string;
    confirmadoAs: string;
    compareceu: boolean | null;
  }[];
}

export interface MotoboyMetric {
  id: string;
  nome: string;
  telefone: string;
  ativo: boolean;
  totalTurnosRealizados: number;
  diaMaisFrequente: string;
  diasSemanaDetalhados: Record<string, number>;
}

export interface ScheduleRule {
  id?: string;
  diaSemana: number; // 0 = Domingo, 1 = Segunda, ... 6 = Sábado
  vagasPadrao: number;
}

export interface WhatsAppStatusData {
  state?: string;
  instance?: {
    state?: string;
  };
}

export interface WhatsAppConnectData {
  base64?: string;
  code?: string;
  pairingCode?: string;
  qrcode?: {
    base64?: string;
  };
}

export async function getTodayScale(): Promise<{ ok: boolean; data?: TodayScale; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/today-scale`, {
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { ok: true, data: undefined, message: "Nenhuma escala criada para hoje." };
      }
      return { ok: false, message: "Erro ao buscar escala de hoje." };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: "Não foi possível se conectar à API de motoboys." };
  }
}

export async function getMotoboysMetrics(): Promise<{ ok: boolean; data?: MotoboyMetric[]; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/motoboys-metrics`, {
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, message: "Erro ao buscar métricas dos motoboys." };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: "Erro de conexão com a API de motoboys." };
  }
}

export async function recordCheckIn(attendanceId: string, compareceu: boolean): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/attendances/${attendanceId}/checkin`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ compareceu }),
    });

    if (!res.ok) {
      return { ok: false, message: "Erro ao atualizar check-in do motoboy." };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Erro ao se comunicar com a API de motoboys." };
  }
}

export async function getWhatsAppStatus(): Promise<{ ok: boolean; state?: string; data?: WhatsAppStatusData; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/evolution/status`, {
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, state: "DISCONNECTED", message: "Instância offline ou não encontrada." };
    }

    const data: WhatsAppStatusData = await res.json();
    const state = data?.instance?.state || data?.state || "DISCONNECTED";
    return { ok: true, state: state.toUpperCase(), data };
  } catch (error) {
    return { ok: false, state: "DISCONNECTED", message: "Erro de conexão com o serviço WhatsApp." };
  }
}

export async function getWhatsAppQrCode(): Promise<{ ok: boolean; data?: WhatsAppConnectData; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/evolution/connect`, {
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, message: "Erro ao solicitar QR Code da Evolution API." };
    }

    const data: WhatsAppConnectData = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: "Erro ao se conectar para obter QR Code." };
  }
}

export async function logoutWhatsApp(): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/evolution/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
    });

    if (!res.ok) {
      return { ok: false, message: "Erro ao desconectar instância do WhatsApp." };
    }

    return { ok: true, message: "Instância desconectada com sucesso." };
  } catch (error) {
    return { ok: false, message: "Erro de rede ao solicitar logout." };
  }
}

export async function getScheduleRules(): Promise<{ ok: boolean; data?: ScheduleRule[]; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/rules`, {
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, message: "Erro ao buscar regras de vagas semanais." };
    }

    const data: ScheduleRule[] = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: "Erro ao se comunicar com a API de motoboys." };
  }
}

export async function updateScheduleRule(diaSemana: number, vagasPadrao: number): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ diaSemana, vagasPadrao }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { ok: false, message: errJson.error || "Erro ao atualizar regra de vagas." };
    }

    return { ok: true, message: "Regra atualizada com sucesso!" };
  } catch (error) {
    return { ok: false, message: "Erro ao salvar alteração de vaga semanal." };
  }
}

export async function triggerOpenScale(vagasTotais?: number): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/open-scale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
      body: JSON.stringify(vagasTotais ? { vagasTotais } : {}),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: json.error || "Erro ao abrir a escala manualmente." };
    }

    return { ok: true, message: json.message || "Escala aberta e notificada no grupo com sucesso!" };
  } catch (error) {
    return { ok: false, message: "Erro de comunicação ao abrir escala." };
  }
}

export async function triggerCloseScale(): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${MOTOBOYS_API_URL}/api/admin/close-scale`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOTOBOYS_ADMIN_TOKEN}`,
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: json.error || "Erro ao fechar a escala de hoje." };
    }

    return { ok: true, message: json.message || "Escala finalizada com sucesso." };
  } catch (error) {
    return { ok: false, message: "Erro de comunicação ao encerrar escala." };
  }
}
