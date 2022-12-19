import { useContext } from 'react';
import StatsigContext, { UpdateUserFunc } from './StatsigContext';

export default function (): UpdateUserFunc {
  const context = useContext(StatsigContext);
  return context.updateUser;
}
