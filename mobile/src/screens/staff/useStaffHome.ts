import { useEffect, useState } from 'react';
import { CheckinAPI, RecentScanLog } from '../../services/checkinApiService';
import Toast from 'react-native-toast-message';

export type EventSummary = {
  total: number;
  checkedIn: number;
  remaining: number;
};

export type TodayEventDummy = {
  zones: any[];
  minPrice: number;
};

export function useStaffHome(eventId: string | undefined) {
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanLog[]>([]);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(!!eventId);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(!!eventId);
  const [refreshing, setRefreshing] = useState(false);

  const todayEvent: TodayEventDummy = {
    zones: [],
    minPrice: 0,
  };

  const loadSummary = async () => {
    if (!eventId) return;
    try {
      setLoadingSummary(true);
      const res = await CheckinAPI.getEventSummary(eventId);
      setSummary(res.data);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Không tải được thống kê check-in',
        text2: err?.message || 'Thử lại sau',
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadRecent = async () => {
    if (!eventId) return;
    try {
      setLoadingRecent(true);
      const res = await CheckinAPI.getRecentScans(eventId, 10);
      setRecentScans(res.data);
    } catch (err: any) {
      console.warn('[StaffHome] loadRecent error', err?.message);
    } finally {
      setLoadingRecent(false);
    }
  };

  const onRefresh = async () => {
    if (!eventId) return;
    setRefreshing(true);
    try {
      await Promise.all([loadSummary(), loadRecent()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    void loadSummary();
    void loadRecent();
  }, [eventId]);

  return {
    summary,
    recentScans,
    loadingSummary,
    loadingRecent,
    refreshing,
    todayEvent,
    onRefresh,
  };
}
