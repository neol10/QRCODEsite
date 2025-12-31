
/**
 * NeoQrC Helper Utilities
 */

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generateAvatarUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};
