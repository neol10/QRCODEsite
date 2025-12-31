
import { MailResponse } from '../types';

/**
 * Serviço responsável por gerenciar envios de e-mail via FormSubmit.
 * Abstrai a complexidade de rede e tratamento de erros da UI.
 */
export const mailService = {
  async sendVerificationCode(email: string, code: string): Promise<MailResponse> {
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: "🔑 SEU CÓDIGO DE ACESSO - NeoQrC",
          message: `Utilize o código abaixo para validar seu acesso ao sistema.\n\nCÓDIGO: ${code}\n\nSe esta é sua primeira vez usando este e-mail no sistema, você receberá um e-mail de ativação do FormSubmit antes deste código.`,
          "Código": code,
          _captcha: "false",
          _template: "table"
        })
      });

      const data = await response.json();
      
      return {
        success: data.success === "true",
        message: data.message,
        needsActivation: data.message?.toLowerCase().includes('activation')
      };
    } catch (error) {
      console.error("MailService Error:", error);
      return { success: false, message: "Falha na conexão com o servidor de e-mail." };
    }
  }
};