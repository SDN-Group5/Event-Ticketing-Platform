import { useEffect, useState } from 'react';
import { CheckinAPI, RecentScanLog } from '../../services/checkinApiService';
import { LayoutAPI } from '../../services/layoutApiService';
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
  const [eventDetails, setEventDetails] = useState<any>(null);

  const loadEventDetails = async () => {
    if (!eventId) return;
    try {
      const data = await LayoutAPI.getLayoutByEvent(eventId);
      setEventDetails(data);
    } catch (err) {
      console.warn('loadEventDetails error:', err);
    }
  };

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
      // Nếu chưa được phân quyền, API có thể lỗi 500/403, ta ẩn lỗi đi vì đây là flow "yêu cầu phụ trách"
      console.log('[StaffHome] loadSummary (possibly unassigned):', err?.message);
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
      console.log('[StaffHome] loadRecent (possibly unassigned):', err?.message);
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
    void loadEventDetails();
    void loadSummary();
    void loadRecent();
  }, [eventId]);

  return {
    summary,
    recentScans,
    loadingSummary,
    loadingRecent,
    refreshing,
    eventDetails,
    onRefresh,
  };
}
