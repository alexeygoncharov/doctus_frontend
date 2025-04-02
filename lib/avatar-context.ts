import { createContext, useContext } from 'react';

// Тип для контекста аватара
interface AvatarContextType {
  avatarUrl: string | null;
  updateAvatar: (url: string | null) => void;
}

// Контекст по умолчанию (будет перезаписан в _app.tsx)
export const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  updateAvatar: () => {},
});

// Hook для использования контекста аватара
export const useAvatarContext = () => useContext(AvatarContext); 