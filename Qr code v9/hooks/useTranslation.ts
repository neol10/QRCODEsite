export const useNeoTranslation = () => {
  const t = (key: string) => {
    const mapa: Record<string, string> = {
      // Analytics
      'analytics.title': 'Analytics',
      
      // Navegação
      'nav.analytics': 'Analytics',
      'nav.generator': 'Gerador',
      'nav.leads': 'Leads',
      'nav.settings': 'Ajustes',
      
      // Configurações
      'settings.title': 'Configurações',
      'settings.logout': 'Sair do Sistema',
      'settings.updateProfile': 'Salvar Perfil',
      'settings.displayName': 'Nome de Exibição',
      'settings.language': 'Idioma',
      
      // Admin
      'admin.title': 'Overseer Dashboard',
      'admin.sync': 'Sincronizar Dados',
      
      // Auth
      'auth.platform': 'PLATFORM.',
      'auth.tagline': 'Gere, gerencie e rastreie seus QR Codes em tempo real.',
      'auth.createAccount': 'Criar Conta NeoQrC',
      'auth.accessAccount': 'Acessar minha Conta',
      'auth.back': 'Voltar',
      'auth.restrictedAccess': 'Acesso Restrito',
      'auth.clientLogin': 'Login Cliente',
      'auth.newSignup': 'Novo Cadastro',
      'auth.credentialsInfo': 'Entre com suas credenciais de acesso.',
      'auth.emailLabel': 'E-mail de Acesso',
      'auth.passwordLabel': 'Senha',
      'auth.enterSystem': 'Entrar no Sistema',
      'auth.accessButton': 'Acessar Conta',
      'auth.createButton': 'Criar Acesso',
      'auth.invalidCredentials': 'Credenciais inválidas.',
      'auth.verifyTitle': 'Confirme sua Identidade',
      'auth.verifyText': 'Enviamos um link de acesso seguro.',
      'auth.backToLogin': 'Voltar para Login'
    };
    
    return mapa[key] || key.split('.').pop() || key;
  };
  
  return { 
    t, 
    i18n: { 
      language: 'pt', 
      changeLanguage: () => {} 
    } 
  };
};