export interface MessageData {
  customerId: string;
  phone: string;
  msg: string;
  timeLastMsg: number;
  name: string;
}

export function ProcessRecivedData(data: any): MessageData | null {
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

    function hasName() {
      if (value.contacts === undefined) {
        return "";
      } else {
        if (value.contacts[0].profile.name === "") return "";
        else return value.contacts[0].profile.name;
      }
    }

    const customerId = message.from;
    const customerPhone = message.from;
    const customerMessage = messageValue();
    const timeLastMsg = message.timestamp;
    const customerName = hasName();
    return {
      customerId: customerId,
      phone: customerPhone,
      msg: customerMessage,
      name: customerName,
      timeLastMsg: Number(timeLastMsg)
    };
  }

  return null;
}
