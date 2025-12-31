// Mensagens de erro amigáveis para o usuário
export const ErrorMessages = {
    // Erros de Autenticação
    AUTH_TIMEOUT: 'A conexão está demorando muito. Verifique sua internet e tente novamente.',
    AUTH_FAILED: 'Não foi possível fazer login. Verifique suas credenciais.',
    SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',

    // Erros de Perfil
    PROFILE_LOAD_ERROR: 'Não foi possível carregar suas informações. Tente novamente.',
    PROFILE_UPDATE_ERROR: 'Erro ao atualizar perfil. Tente novamente mais tarde.',
    PROFILE_TIMEOUT: 'Tempo esgotado ao carregar perfil. Verifique sua conexão.',

    // Erros de QR Code
    QR_CREATE_ERROR: 'Erro ao criar QR Code. Tente novamente.',
    QR_LOAD_ERROR: 'Não foi possível carregar seus QR Codes.',
    QR_DELETE_ERROR: 'Erro ao deletar QR Code.',

    // Erros de Leads
    LEAD_CAPTURE_ERROR: 'Erro ao capturar lead. Tente novamente.',
    LEAD_LOAD_ERROR: 'Não foi possível carregar os leads.',

    // Erros de Admin
    ADMIN_UNAUTHORIZED: 'Você não tem permissão para acessar esta área.',
    ADMIN_DATA_ERROR: 'Erro ao carregar dados administrativos.',

    // Erros Gerais
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    UNKNOWN_ERROR: 'Algo deu errado. Tente novamente.',
    DATABASE_ERROR: 'Erro ao acessar o banco de dados.',
};

// Mensagens de sucesso
export const SuccessMessages = {
    QR_CREATED: 'QR Code criado com sucesso! 🎉',
    QR_UPDATED: 'QR Code atualizado!',
    QR_DELETED: 'QR Code removido.',

    LEAD_CAPTURED: 'Lead capturado com sucesso! 📊',

    PROFILE_UPDATED: 'Perfil atualizado!',

    LOGIN_SUCCESS: 'Bem-vindo de volta!',
    LOGOUT_SUCCESS: 'Até logo! 👋',
};

// Mensagens informativas
export const InfoMessages = {
    LOADING: 'Carregando...',
    SYNCING: 'Sincronizando dados...',
    PROCESSING: 'Processando...',
    SAVING: 'Salvando...',
};
