import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { useSession } from 'next-auth/react'; // Больше не нужен здесь

interface MessageLimitContextType {
  messagesCount: number;
  messagesLimit: number;
  incrementCount: () => void;
  resetCount: () => void;
  hasReachedLimit: boolean;
}

const defaultContext: MessageLimitContextType = {
  messagesCount: 0,
  messagesLimit: 20,
  incrementCount: () => {},
  resetCount: () => {},
  hasReachedLimit: false,
};

const MessageLimitContext = createContext<MessageLimitContextType>(defaultContext);

export const useMessageLimit = () => useContext(MessageLimitContext);

export const MessageLimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const messagesLimit = parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGES_LIMIT || '20', 10);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);

  // Загружаем счетчик из localStorage при инициализации для всех
  useEffect(() => {
    const storedCount = localStorage.getItem('freeMessagesCount');
    if (storedCount) {
      const count = parseInt(storedCount, 10);
      setMessagesCount(count);
      // hasReachedLimit будет вычислен в следующем useEffect
    } else {
      // Если в localStorage ничего нет, устанавливаем 0
      setMessagesCount(0);
    }
    // Зависимость только от messagesLimit, чтобы пересчитать hasReachedLimit при его изменении
  }, []); // Пустой массив зависимостей, чтобы выполнилось один раз при монтировании

  // Вычисляем и сохраняем счетчик в localStorage при его изменении
  useEffect(() => {
    // Сохраняем текущее значение счетчика
    localStorage.setItem('freeMessagesCount', messagesCount.toString());
    // Обновляем флаг достижения лимита
    setHasReachedLimit(messagesCount >= messagesLimit);
    // Зависим от messagesCount и messagesLimit
  }, [messagesCount, messagesLimit]);

  // Инкрементируем счетчик всегда (проверка подписки будет в компонентах)
  const incrementCount = () => {
    setMessagesCount(prevCount => prevCount + 1);
  };

  // Сбрасываем счетчик всегда (например, при логауте или покупке подписки)
  const resetCount = () => {
    setMessagesCount(0);
    // localStorage обновится в useEffect
  };

  const value: MessageLimitContextType = {
    messagesCount,
    messagesLimit,
    incrementCount,
    resetCount,
    hasReachedLimit, // Этот флаг теперь отражает только достижение числового лимита
  };

  return (
    <MessageLimitContext.Provider value={value}>
      {children}
    </MessageLimitContext.Provider>
  );
};

export default MessageLimitContext; 