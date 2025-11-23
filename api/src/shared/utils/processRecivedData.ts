export function ProcessRecivedData(data: any): {
  id: string;
  phone: string;
  msg: string;
  timeLastMsg: number;
  name: string;
} | null {
  const changes = data.entry?.[0]?.changes?.[0];
  const value = changes?.value;

  if (value?.messages) {
    const message = value.messages[0];
    const messageValue = (): string => {
      if (message.type === "text") {
        return message.text.body;
      }
      if (message.type === "button") {
        return message.button.text;
      } else return "";
    };

    const costumerId = data.entry[0].id;
    const costumerPhone = message.from;
    const costumerMessage = messageValue();
    const timeLastMsg = message.timestamp;
    const customerName = value.contacts[0].profile.name
      ? value.contacts[0].profile.name
      : "";

    return {
      id: costumerId,
      phone: costumerPhone,
      msg: costumerMessage,
      name: customerName,
      timeLastMsg: Number(timeLastMsg)
    };
  }

  return null;
}
