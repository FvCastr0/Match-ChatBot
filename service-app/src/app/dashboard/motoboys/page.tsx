"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getMotoboysMetrics,
  getScheduleRules,
  getTodayScale,
  getWhatsAppQrCode,
  getWhatsAppStatus,
  logoutWhatsApp,
  MotoboyMetric,
  recordCheckIn,
  ScheduleRule,
  TodayScale,
  triggerCloseScale,
  triggerOpenScale,
  updateScheduleRule,
} from "@/services/motoboys";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  Bike,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  Play,
  QrCode,
  RefreshCw,
  Save,
  Square,
  UserCheck,
  UserX,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const DIAS_SEMANA_NOMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default function MotoboysPage() {
  const [scale, setScale] = useState<TodayScale | null>(null);
  const [metrics, setMetrics] = useState<MotoboyMetric[]>([]);
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status WhatsApp
  const [wpStatus, setWpStatus] = useState<string>("CHECKING");
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Modal QR Code
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeImg, setQrCodeImg] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Modal Escalação Manual
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
  const [vagasManualInput, setVagasManualInput] = useState<number>(10);
  const [submittingScale, setSubmittingScale] = useState(false);

  // Edição de Vagas Semanais
  const [editedRules, setEditedRules] = useState<Record<number, number>>({});
  const [savingRuleDay, setSavingRuleDay] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scaleRes, metricsRes, rulesRes, wpRes] = await Promise.all([
        getTodayScale(),
        getMotoboysMetrics(),
        getScheduleRules(),
        getWhatsAppStatus(),
      ]);

      if (scaleRes.ok && scaleRes.data) {
        setScale(scaleRes.data);
      } else {
        setScale(null);
      }

      if (metricsRes.ok && metricsRes.data) {
        setMetrics(metricsRes.data);
      }

      if (rulesRes.ok && rulesRes.data) {
        setRules(rulesRes.data);
        const mapRules: Record<number, number> = {};
        // Inicializa valores dos 7 dias
        for (let i = 0; i <= 6; i++) {
          const found = rulesRes.data.find((r) => r.diaSemana === i);
          mapRules[i] = found ? found.vagasPadrao : 10;
        }
        setEditedRules(mapRules);
      }

      if (wpRes.ok && wpRes.state) {
        setWpStatus(wpRes.state);
      } else {
        setWpStatus("DISCONNECTED");
      }
    } catch (error) {
      toast.error("Erro ao carregar informações dos motoboys.");
    } finally {
      setLoading(false);
    }
  };

  const checkWpStatus = async () => {
    setLoadingStatus(true);
    const res = await getWhatsAppStatus();
    if (res.ok && res.state) {
      setWpStatus(res.state);
    } else {
      setWpStatus("DISCONNECTED");
    }
    setLoadingStatus(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Busca o QR code e abre a modal
  const handleOpenQrModal = async () => {
    setQrDialogOpen(true);
    setLoadingQr(true);
    setQrCodeImg(null);

    const res = await getWhatsAppQrCode();
    if (res.ok && res.data) {
      const img = res.data.base64 || res.data.qrcode?.base64 || null;
      setQrCodeImg(img);
    } else {
      toast.error(res.message || "Não foi possível gerar o QR Code.");
    }
    setLoadingQr(false);
    checkWpStatus();
  };

  const handleLogoutWp = async () => {
    if (!confirm("Tem certeza que deseja desconectar o WhatsApp?")) return;

    setLoadingStatus(true);
    const res = await logoutWhatsApp();
    if (res.ok) {
      toast.success("WhatsApp desconectado com sucesso.");
      setWpStatus("DISCONNECTED");
      setQrDialogOpen(false);
    } else {
      toast.error(res.message || "Falha ao desconectar WhatsApp.");
    }
    setLoadingStatus(false);
  };

  const handleCheckInToggle = async (attendanceId: string, currentStatus: boolean | null) => {
    const nextStatus = currentStatus === true ? false : true;
    setUpdatingId(attendanceId);

    const res = await recordCheckIn(attendanceId, nextStatus);

    if (res.ok) {
      toast.success(
        nextStatus
          ? "Presença confirmada no turno com sucesso! 🚀"
          : "Presença removida."
      );
      loadData();
    } else {
      toast.error(res.message || "Falha ao registrar check-in.");
    }
    setUpdatingId(null);
  };

  // Salvar Regra de Vagas para 1 Dia
  const handleSaveRule = async (diaSemana: number) => {
    const vagas = editedRules[diaSemana];
    if (vagas === undefined || vagas < 0) {
      toast.error("Insira uma quantidade válida de vagas.");
      return;
    }

    setSavingRuleDay(diaSemana);
    const res = await updateScheduleRule(diaSemana, vagas);

    if (res.ok) {
      toast.success(`Vagas de ${DIAS_SEMANA_NOMES[diaSemana]} atualizadas para ${vagas}!`);
      loadData();
    } else {
      toast.error(res.message || "Erro ao salvar vagas do dia.");
    }
    setSavingRuleDay(null);
  };

  // Abrir Escalação Manualmente
  const handleOpenScaleSubmit = async () => {
    setSubmittingScale(true);
    const res = await triggerOpenScale(vagasManualInput);

    if (res.ok) {
      toast.success(res.message);
      setScaleDialogOpen(false);
      loadData();
    } else {
      toast.error(res.message);
    }
    setSubmittingScale(false);
  };

  // Encerramento Manual de Escala
  const handleCloseScaleSubmit = async () => {
    if (!confirm("Deseja realmente encerrar a escala ativa de hoje?")) return;

    setSubmittingScale(true);
    const res = await triggerCloseScale();

    if (res.ok) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }
    setSubmittingScale(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-500 font-medium">Carregando informações da equipe de motoboys...</p>
      </div>
    );
  }

  const isConnected = wpStatus === "OPEN" || wpStatus === "CONNECTED";

  return (
    <div className="space-y-8 text-white">
      {/* Header com Conexão WhatsApp e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-6 rounded-2xl border border-border/40 backdrop-blur-md shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Bike className="w-8 h-8 text-primary" />
            Gestão de Motoboys
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Controle a escala diária, assiduidade, vagas semanais e conexão do bot de WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status WhatsApp */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
            {isConnected ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 flex items-center gap-1.5 font-semibold text-xs">
                <Wifi className="w-3.5 h-3.5" /> WhatsApp Conectado
              </Badge>
            ) : wpStatus === "CONNECTING" ? (
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 flex items-center gap-1.5 font-semibold text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Conectando...
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-1 flex items-center gap-1.5 font-semibold text-xs">
                <WifiOff className="w-3.5 h-3.5" /> Desconectado
              </Badge>
            )}

            {/* Botão QR Code Pop-up */}
            <Button
              size="sm"
              onClick={handleOpenQrModal}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              Ver QR Code
            </Button>
          </div>

          {/* Botão Iniciar Escalação Manual */}
          <Button
            onClick={() => {
              const todayDay = new Date().getDay();
              setVagasManualInput(editedRules[todayDay] || 10);
              setScaleDialogOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-md shadow-emerald-950/40"
          >
            <Play className="w-4 h-4" />
            Iniciar Escalação Manual
          </Button>

          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="border-white/10 text-slate-300 hover:bg-white/5 flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Seção 1: Escala do Dia */}
      <Card className="border border-border/40 bg-card text-card-foreground shadow-md">
        <CardHeader className="bg-white/5 border-b border-border/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Escala de Hoje ({format(new Date(), "dd 'de' MMMM", { locale: ptBR })})
              </CardTitle>
              <CardDescription className="text-slate-400">
                Entregadores confirmados e alocados para o turno atual
              </CardDescription>
            </div>
            {scale && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-950/30 text-amber-500 border-amber-500 px-3 py-1 font-semibold text-xs">
                  Vagas: {scale.vagasPreenchidas} / {scale.vagasTotais}
                </Badge>
                <Badge
                  className={
                    scale.status === "ABERTO" || scale.status === "aberta"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-white"
                  }
                >
                  Status: {scale.status.toUpperCase()}
                </Badge>

                {(scale.status === "ABERTO" || scale.status === "aberta") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCloseScaleSubmit}
                    disabled={submittingScale}
                    className="text-xs flex items-center gap-1 h-7"
                  >
                    <Square className="w-3 h-3" /> Encerrar Escala
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!scale || scale.confirmados.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-300 font-semibold text-base">
                {!scale ? "Nenhuma escala ativa criada para hoje." : "Nenhum motoboy confirmado até o momento."}
              </p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                A abertura automática ocorre no horário agendado ou você pode acionar manualmente a qualquer momento.
              </p>
              <Button
                onClick={() => {
                  const todayDay = new Date().getDay();
                  setVagasManualInput(editedRules[todayDay] || 10);
                  setScaleDialogOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold mt-2"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" /> Abrir Escala Agora
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-b border-border/20">
                    <TableHead className="font-bold text-slate-200">Motoboy</TableHead>
                    <TableHead className="font-bold text-slate-200">Telefone</TableHead>
                    <TableHead className="font-bold text-slate-200">Horário de Inscrição</TableHead>
                    <TableHead className="font-bold text-slate-200">Presença (Check-in)</TableHead>
                    <TableHead className="text-right font-bold text-slate-200">Ação Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scale.confirmados.map((motoboy) => (
                    <TableRow key={motoboy.attendanceId} className="hover:bg-white/5 border-b border-border/10 transition-colors">
                      <TableCell className="font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                          {motoboy.nome.substring(0, 2).toUpperCase()}
                        </div>
                        {motoboy.nome}
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm">{motoboy.telefone}</TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {motoboy.confirmadoAs
                          ? format(new Date(motoboy.confirmadoAs), "HH:mm:ss")
                          : "N/I"}
                      </TableCell>
                      <TableCell>
                        {motoboy.compareceu === true ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Compareceu
                          </Badge>
                        ) : motoboy.compareceu === false ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <UserX className="w-3 h-3" /> Ausente
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-white/10 text-slate-300 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Aguardando
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={updatingId === motoboy.attendanceId}
                          onClick={() => handleCheckInToggle(motoboy.attendanceId, motoboy.compareceu)}
                          className={
                            motoboy.compareceu === true
                              ? "bg-slate-700 hover:bg-slate-800 text-white text-xs"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          }
                        >
                          {motoboy.compareceu === true ? (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" /> Desfazer Check-in
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" /> Confirmar Check-in
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 2: Controle de Vagas Semanais */}
      <Card className="border border-border/40 bg-card text-card-foreground shadow-md">
        <CardHeader className="bg-white/5 border-b border-border/20">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Controle de Vagas Semanais
          </CardTitle>
          <CardDescription className="text-slate-400">
            Defina o limite padrão de vagas disponibilizadas para os motoboys para cada dia da semana.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {DIAS_SEMANA_NOMES.map((nomeDia, idx) => {
              const isToday = new Date().getDay() === idx;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${isToday
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                      : "bg-white/5 border-white/10"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">
                      {nomeDia}
                    </span>
                    {isToday && (
                      <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] px-1.5 py-0 font-semibold">
                        Hoje
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Vagas Padrão
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={editedRules[idx] ?? 10}
                      onChange={(e) =>
                        setEditedRules({
                          ...editedRules,
                          [idx]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/5 border-white/10 text-white font-bold text-center h-9"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleSaveRule(idx)}
                    disabled={savingRuleDay === idx}
                    className="w-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs h-8 flex items-center justify-center gap-1 border border-white/10"
                  >
                    {savingRuleDay === idx ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3 h-3" /> Salvar
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Métricas Históricas */}
      <Card className="border border-border/40 bg-card text-card-foreground shadow-md">
        <CardHeader className="bg-white/5 border-b border-border/20">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Métricas Históricas de Assiduidade
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ranking de presença e análise dos dias com maior frequência de trabalho da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum histórico de motoboys cadastrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-b border-border/20">
                    <TableHead className="font-bold text-slate-200">Entregador</TableHead>
                    <TableHead className="font-bold text-slate-200">Telefone</TableHead>
                    <TableHead className="font-bold text-slate-200">Status Cadastral</TableHead>
                    <TableHead className="font-bold text-slate-200">Total de Turnos</TableHead>
                    <TableHead className="font-bold text-slate-200">Dia Mais Frequente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((m) => (
                    <TableRow key={m.id} className="hover:bg-white/5 border-b border-border/10 transition-colors">
                      <TableCell className="font-semibold text-white">{m.nome}</TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm">{m.telefone}</TableCell>
                      <TableCell>
                        <Badge className={m.ativo ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}>
                          {m.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-300 text-sm">
                        {m.totalTurnosRealizados} turnos
                      </TableCell>
                      <TableCell className="text-slate-300 font-medium">
                        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary font-semibold">
                          {m.diaMaisFrequente}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* POPUP MODAL 1: QR Code WhatsApp */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> Conexão do Bot de WhatsApp
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Abra o WhatsApp no celular, vá em Dispositivos Conectados &gt; Conectar um dispositivo e leia o QR Code abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-slate-950/60 rounded-xl border border-slate-800 my-2">
            {loadingQr ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-slate-400">Solicitando QR Code à Evolution API...</p>
              </div>
            ) : isConnected ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wifi className="w-8 h-8" />
                </div>
                <p className="font-bold text-emerald-400 text-base">WhatsApp está Conectado!</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Sua instância está ativa e pronta para enviar mensagens no grupo e receber respostas de motoboys.
                </p>
              </div>
            ) : qrCodeImg ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <img
                    src={qrCodeImg.startsWith("data:") ? qrCodeImg : `data:image/png;base64,${qrCodeImg}`}
                    alt="QR Code WhatsApp"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <p className="text-sm font-semibold text-slate-300">QR Code não disponível momento.</p>
                <p className="text-xs text-slate-500">Tente recarregar o QR Code ou verifique a Evolution API.</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {isConnected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogoutWp}
                className="w-full sm:w-auto text-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Desconectar Instância
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenQrModal}
                disabled={loadingQr}
                className="w-full sm:w-auto border-white/10 text-slate-300 hover:bg-white/5 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQr ? "animate-spin" : ""}`} /> Recarregar QR Code
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQrDialogOpen(false)}
              className="w-full sm:w-auto text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POPUP MODAL 2: Escalação Manual */}
      <Dialog open={scaleDialogOpen} onOpenChange={setScaleDialogOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-500" /> Iniciar Escalação Manual
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Isso abrirá a escala no banco de dados e enviará o aviso de abertura de vagas para o grupo de WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Quantidade de Vagas para Hoje
              </label>
              <Input
                type="number"
                min={1}
                value={vagasManualInput}
                onChange={(e) => setVagasManualInput(parseInt(e.target.value) || 1)}
                className="bg-slate-950 border-slate-800 text-white font-bold text-lg h-11"
              />
              <p className="text-[11px] text-slate-500">
                Padrão para hoje ({DIAS_SEMANA_NOMES[new Date().getDay()]}): {editedRules[new Date().getDay()] || 10} vagas.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScaleDialogOpen(false)}
              className="w-full sm:w-auto text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOpenScaleSubmit}
              disabled={submittingScale}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              {submittingScale ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Confirmar e Disparar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
