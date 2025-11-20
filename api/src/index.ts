import express from "express";
import whatsappWebhook from "./api/whatsapp-webhook.js";
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use("/webhook", whatsappWebhook);
app.listen(port, () => {
  console.log("Servidor rodando 🚀");
});
