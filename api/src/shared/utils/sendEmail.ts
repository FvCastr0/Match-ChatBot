import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendEmailInvalidToken(detalhesErro: any, email: string) {
  try {
    await transporter.sendMail({
      from: '"Monitoramento do Sistema" <fvdc2008@gmail.com>',
      to: email,
      subject: "🚨 URGENTE: Token do Facebook Expirou (Erro 190)",
      html: `
        <h2>Atenção: O sistema parou de enviar mensagens.</h2>
        <p>O token de acesso precisa ser renovado imediatamente.</p>
        <p>Entre em contato pelo número: 32991966510</p>
        <p><strong>Código do Erro:</strong> ${detalhesErro?.code}</p>
        <p><strong>Mensagem:</strong> ${detalhesErro?.message}</p>
        <br>
        <pre>Trace ID: ${detalhesErro?.fbtrace_id}</pre>
      `
    });
  } catch (emailError) {
    console.error("Falha ao enviar e-mail de alerta:", emailError);
  }
}
