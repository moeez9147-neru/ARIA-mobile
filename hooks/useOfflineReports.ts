import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'aria_offline_reports';
const MAX_REPORTS = 5;

export type OfflineReport = {
  id: string;
  query: string;
  createdAt: string;
  market: string;
  competitors: string;
  audience: string;
  content: string;
};

export function useOfflineReports() {

  const getSavedReports = async (): Promise<OfflineReport[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveReport = async (report: OfflineReport): Promise<void> => {
    try {
      const existing = await getSavedReports();
      const filtered = existing.filter(r => r.id !== report.id);
      const updated = [report, ...filtered].slice(0, MAX_REPORTS);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save report offline:', error);
    }
  };

  const clearReports = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear reports:', error);
    }
  };

  return { getSavedReports, saveReport, clearReports };
}