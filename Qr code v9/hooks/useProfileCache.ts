// Hook para cache de perfil do usuário
import { useState, useEffect } from 'react';
import { Profile } from '../types';

const PROFILE_CACHE_KEY = 'neoqrc_user_profile';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CachedProfile {
    data: Profile;
    timestamp: number;
}

export const useProfileCache = () => {
    const [cachedProfile, setCachedProfile] = useState<Profile | null>(null);

    // Carregar do cache ao iniciar
    useEffect(() => {
        const cached = localStorage.getItem(PROFILE_CACHE_KEY);
        if (cached) {
            try {
                const parsed: CachedProfile = JSON.parse(cached);
                const now = Date.now();

                // Verificar se o cache ainda é válido
                if (now - parsed.timestamp < CACHE_DURATION) {
                    setCachedProfile(parsed.data);
                } else {
                    // Cache expirado, remover
                    localStorage.removeItem(PROFILE_CACHE_KEY);
                }
            } catch (err) {
                console.error('Erro ao carregar cache de perfil:', err);
                localStorage.removeItem(PROFILE_CACHE_KEY);
            }
        }
    }, []);

    // Salvar perfil no cache
    const saveProfile = (profile: Profile) => {
        const cached: CachedProfile = {
            data: profile,
            timestamp: Date.now()
        };
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cached));
        setCachedProfile(profile);
    };

    // Limpar cache
    const clearProfile = () => {
        localStorage.removeItem(PROFILE_CACHE_KEY);
        setCachedProfile(null);
    };

    return {
        cachedProfile,
        saveProfile,
        clearProfile
    };
};
