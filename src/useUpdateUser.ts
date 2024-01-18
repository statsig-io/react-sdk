import { useContext } from 'react';
import { StatsigContext, UpdateUserFunc } from './StatsigContext';

export const useUpdateUser = (): UpdateUserFunc => {
  const context = useContext(StatsigContext);
  return context.updateUser;
};
