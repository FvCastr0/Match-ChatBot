import { Router } from "express";
import type { CostumerData } from "../interfaces/costumerData.js";

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
router.post("/", (req, res) => {
  const data = req.body;
  const costumerId = req.body.entry[0].id;
  const costumerPhone = data.entry[0].changes[0].value.messages[0];

  const costumerData: CostumerData = {
    id: costumerId,
    phone: costumerPhone
  };

  console.log(costumerData);

  res.sendStatus(200);
});

export default router;
