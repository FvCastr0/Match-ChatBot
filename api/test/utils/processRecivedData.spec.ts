import { ProcessRecivedData } from "src/shared/utils/processRecivedData";

interface Data {
  id: string;
  phone: string;
  msg: string;
  timeLastMsg: number;
  name: string;
}

describe("Process Recived Data Parser", () => {
  it("should parse a standart text message correctly", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "5511999998888",
                    id: "MSG_ID_FROM_WHATSAPP",
                    timestamp: "1678886400",
                    type: "text",
                    text: {
                      body: "Olá, esta é uma mensagem de teste!"
                    }
                  }
                ],
                contacts: [
                  {
                    profile: {
                      name: "João Testador"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).not.toBeNull();

    expect(result?.id).toBe("WHATSAPP_BUSINESS_ACCOUNT_ID");
    expect(result?.phone).toBe("5511999998888");
    expect(result?.name).toBe("João Testador");
    expect(result?.msg).toBe("Olá, esta é uma mensagem de teste!");
    expect(result?.timeLastMsg).toBe(1678886400);
  });

  it("should return null if 'value.messages' is missing", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                contacts: [
                  {
                    profile: { name: "João Testador" }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).toBeNull();
  });

  it("should return the message value if message type = text", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "5511999998888",
                    id: "MSG_ID_FROM_WHATSAPP",
                    timestamp: "1678886400",
                    type: "text",
                    text: {
                      body: "Olá, esta é uma mensagem de teste!"
                    }
                  }
                ],
                contacts: [
                  {
                    profile: {
                      name: "João Testador"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).not.toBeNull();
    expect(result?.msg).toBe("Olá, esta é uma mensagem de teste!");
  });

  it("should return the message value if message type = button", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "5511999998888",
                    id: "MSG_ID_FROM_WHATSAPP",
                    timestamp: "1678886400",
                    type: "button",
                    button: {
                      text: "Olá, esta é uma mensagem de teste!"
                    }
                  }
                ],
                contacts: [
                  {
                    profile: {
                      name: "João Testador"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).not.toBeNull();
    expect(result?.msg).toBe("Olá, esta é uma mensagem de teste!");
  });

  it("should return a empty string if type is different from button or text", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "5511999998888",
                    id: "MSG_ID_FROM_WHATSAPP",
                    timestamp: "1678886400",
                    type: "image",
                    image: {
                      url: "abc"
                    }
                  }
                ],
                contacts: [
                  {
                    profile: {
                      name: "João Testador"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).not.toBeNull();
    expect(result?.msg).toBe("");
  });

  it("should return the name", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "5511999998888",
                    id: "MSG_ID_FROM_WHATSAPP",
                    timestamp: "1678886400",
                    type: "image",
                    image: {
                      url: "abc"
                    }
                  }
                ],
                contacts: [
                  {
                    profile: {
                      name: "João Testador"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("João Testador");
  });

  it("should not return a name", () => {
    const mockData = {
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              value: {
                messages: [
                  {
                    from: "5511999998888",
                    id: "MSG_ID_FROM_WHATSAPP",
                    timestamp: "1678886400",
                    type: "image",
                    image: {
                      url: "abc"
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = ProcessRecivedData(mockData);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("");
  });
});
