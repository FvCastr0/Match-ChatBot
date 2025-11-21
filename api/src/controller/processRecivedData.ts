export function ProcessRecivedData(data: any): {
  id: number;
  phone: number;
  msg: string;
  timeLastMsg: number;
} | null {
  const changes = data.entry?.[0]?.changes?.[0];
  const value = changes?.value;

  if (value?.messages) {
    const message = value.messages[0];
    if (message.type !== "text" || !message.text) {
      return null;
    }

    const costumerId = data.entry[0].id;
    const costumerPhone = message.from;
    const costumerMessage = message.text.body;
    const timeLastMsg = message.timestamp;

    return {
      id: Number(costumerId),
      phone: Number(costumerPhone),
      msg: costumerMessage,
      timeLastMsg: Number(timeLastMsg)
    };
  }

  // Retorna null para notificações de status ou outras estruturas desconhecidas
  return null;
}
