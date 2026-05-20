/**
 * AdminDashboard Context
 * Provides all shared state and handlers to sub-components
 * without prop drilling across 4500+ lines.
 */
import { createContext, useContext } from 'react';

export const DashboardContext = createContext(null);

/**
 * Hook to consume dashboard context in any child component.
 * Usage: const ctx = useDashboard();
 */
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within AdminDashboard');
  return ctx;
}
