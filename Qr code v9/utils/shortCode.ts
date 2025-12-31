// Gerador de short codes para QR Codes dinâmicos
export const generateShortCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Gerar short code único (verifica se já existe)
export const generateUniqueShortCode = async (existingCodes: string[] = []): Promise<string> => {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    code = generateShortCode();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Não foi possível gerar um código único após várias tentativas');
    }
  } while (existingCodes.includes(code));

  return code;
};

// Validar formato do short code
export const isValidShortCode = (code: string): boolean => {
  return /^[a-z0-9]{6}$/.test(code);
};

// Construir URL de redirect
export const buildRedirectUrl = (baseUrl: string, shortCode: string): string => {
  return `${baseUrl}/r/${shortCode}`;
};
