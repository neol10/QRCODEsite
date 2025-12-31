import { Profile } from '../types';

// Validação de permissões do usuário
export const Permissions = {
    // Verificar se o usuário é admin
    isAdmin: (profile: Profile | null): boolean => {
        return profile?.is_admin === true;
    },

    // Verificar se o usuário pode acessar o admin dashboard
    canAccessAdminDashboard: (profile: Profile | null): boolean => {
        return Permissions.isAdmin(profile);
    },

    // Verificar se o usuário pode ver todos os QR codes
    canViewAllQRCodes: (profile: Profile | null): boolean => {
        return Permissions.isAdmin(profile);
    },

    // Verificar se o usuário pode ver todos os leads
    canViewAllLeads: (profile: Profile | null): boolean => {
        return Permissions.isAdmin(profile);
    },

    // Verificar se o usuário pode deletar QR codes de outros usuários
    canDeleteOthersQRCodes: (profile: Profile | null): boolean => {
        return Permissions.isAdmin(profile);
    },

    // Verificar se o usuário pode editar um QR code específico
    canEditQRCode: (profile: Profile | null, qrCodeUserId: string): boolean => {
        if (!profile) return false;
        // Admin pode editar qualquer QR code, usuário comum só os próprios
        return Permissions.isAdmin(profile) || profile.id === qrCodeUserId;
    },

    // Verificar se o usuário pode deletar um QR code específico
    canDeleteQRCode: (profile: Profile | null, qrCodeUserId: string): boolean => {
        if (!profile) return false;
        // Admin pode deletar qualquer QR code, usuário comum só os próprios
        return Permissions.isAdmin(profile) || profile.id === qrCodeUserId;
    },

    // Verificar se o usuário está autenticado
    isAuthenticated: (profile: Profile | null): boolean => {
        return profile !== null;
    },
};

// Guard para proteger componentes/rotas
export const requireAuth = (profile: Profile | null): void => {
    if (!Permissions.isAuthenticated(profile)) {
        throw new Error('Usuário não autenticado');
    }
};

export const requireAdmin = (profile: Profile | null): void => {
    requireAuth(profile);
    if (!Permissions.isAdmin(profile)) {
        throw new Error('Acesso negado: permissões de administrador necessárias');
    }
};
