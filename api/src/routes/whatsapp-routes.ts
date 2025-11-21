import { Router } from "express";
import { ProcessRecivedData } from "../controller/processRecivedData.js";
import { costumerService } from "../core/costumer-service.js";
import { sendMessage } from "../utils/sendMessage.js";

const router = Router();

// Verificar webhook
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode == "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403);
  }
});

// Receber mensagem
router.post("/", async (req, res) => {
  const data = req.body;

  const processedData = ProcessRecivedData(data);

  if (!processedData) {
    return res.sendStatus(200);
  }

  const isCostumer = await costumerService.FindCostumer(processedData.id);

  if (!isCostumer) {
    costumerService.CreateCostumer(
      processedData.id,
      processedData.phone,
      processedData.timeLastMsg,
      processedData.msg
    );
  } else {
    costumerService.updateLastMessage(
      processedData.id,
      processedData.timeLastMsg,
      processedData.msg
    );
  }

  await sendMessage();

  res.sendStatus(200);
});

export default router;
