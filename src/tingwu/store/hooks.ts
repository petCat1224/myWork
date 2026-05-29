import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { TingwuAppDispatch, TingwuRootState } from './index';

/**
 * 类型安全的 Redux dispatch Hook。
 */
export const useTingwuDispatch = () => useDispatch<TingwuAppDispatch>();

/**
 * 类型安全的 Redux selector Hook。
 */
export const useTingwuSelector: TypedUseSelectorHook<TingwuRootState> = useSelector;
