import React, { ReactNode } from 'react';
import { Profile } from '../types';
import { Permissions } from '../utils/permissions';
import { Lock, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    profile: Profile | null;
    requireAdmin?: boolean;
    fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    profile,
    requireAdmin = false,
    fallback
}) => {
    // Verificar autenticação
    if (!Permissions.isAuthenticated(profile)) {
        return fallback || (
            <div className="min-h-screen bg-[#060E0D] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1A2F2C] border border-yellow-500/20 rounded-[40px] p-10 space-y-6 text-center">
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
                        <Lock className="text-yellow-500" size={40} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white uppercase italic">
                            Autenticação Necessária
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Você precisa estar logado para acessar esta área.
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-2xl font-bold text-sm transition-all"
                    >
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    // Verificar permissões de admin se necessário
    if (requireAdmin && !Permissions.isAdmin(profile)) {
        return fallback || (
            <div className="min-h-screen bg-[#060E0D] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1A2F2C] border border-red-500/20 rounded-[40px] p-10 space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <ShieldAlert className="text-red-500" size={40} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white uppercase italic">
                            Acesso Negado
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Você não tem permissão para acessar esta área administrativa.
                        </p>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all border border-white/10"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    // Usuário autenticado e com permissões adequadas
    return <>{children}</>;
};

export default ProtectedRoute;
