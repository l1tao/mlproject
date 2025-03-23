import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 创建主题存储
export const useThemeStore = create(
  persist(
    (set) => ({
      // 默认使用暗色主题
      theme: 'dark',
      
      // 切换主题
      setTheme: (newTheme) => set({ theme: newTheme }),
    }),
    {
      name: 'theme-storage', // 本地存储的键名
    }
  )
);