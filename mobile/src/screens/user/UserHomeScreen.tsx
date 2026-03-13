import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { EventLayout, LayoutAPI } from '../../services/layoutApiService';
import { useFocusEffect } from '@react-navigation/native';

export default function UserScreen({ navigation }: any) {
  const { user, refreshUser, logout } = useAuth();
  const [events, setEvents] = useState<EventLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshUser();
    }, [refreshUser])
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await LayoutAPI.listLayouts();
        if (!isMounted) return;
        setEvents(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Không tải được danh sách sự kiện');
        setEvents([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const { upNext, recommended } = useMemo(() => {
    if (!events.length) return { upNext: null as EventLayout | null, recommended: [] as EventLayout[] };

    const now = new Date();
    const withDate = events
      .map((e) => {
        if (!e.eventDate) return null;
        const d = new Date(e.eventDate);
        if (Number.isNaN(d.getTime())) return null;
        return { event: e, date: d };
      })
      .filter((x): x is { event: EventLayout; date: Date } => !!x);

    const future = withDate.filter((x) => x.date.getTime() > now.getTime());
    future.sort((a, b) => a.date.getTime() - b.date.getTime());

    const next = future[0]?.event || null;
    const remaining = events.filter((e) => !next || e.eventId !== next.eventId);

    return { upNext: next, recommended: remaining.slice(0, 10) };
  }, [events]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarWrapper}
          >
            <ImageBackground 
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=68' }} 
              style={styles.avatarImage}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color="#d500f9" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Explore')}
            style={[styles.quickActionCard, styles.quickActionDiscover]}
          >
            <MaterialIcons name="explore" size={32} color="#d500f9" />
            <Text style={styles.quickActionText}>Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Tickets')}
            style={[styles.quickActionCard, styles.quickActionTickets]}
          >
            <MaterialIcons name="local-activity" size={32} color="#00e5ff" />
            <Text style={styles.quickActionText}>My Tickets</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Event */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tickets')}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !upNext ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Chưa có sự kiện sắp diễn ra</Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => navigation.navigate('EventDetail', { eventId: upNext.eventId })}
            style={styles.upNextCard}
          >
            <ImageBackground
              source={{ uri: upNext.eventImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' }}
              style={styles.upNextImage}
            >
              <View style={styles.upNextBadge}>
                <Text style={styles.upNextBadgeText}>Upcoming</Text>
              </View>
            </ImageBackground>
            
            <View style={styles.upNextInfoWrapper}>
              <View style={styles.upNextQrWrapper}>
                <MaterialIcons name="qr-code-2" size={24} color="#0a0014" />
              </View>
              
              <Text style={styles.upNextTitle}>{upNext.eventName || 'Event'}</Text>
              
              <View style={styles.upNextMetaRow}>
                <MaterialIcons name="access-time" size={16} color="#b388ff" />
                <Text style={styles.upNextMetaText}>
                  {upNext.eventDate ? new Date(upNext.eventDate).toLocaleTimeString() : 'TBD'}
                </Text>
              </View>
              
              <View style={styles.upNextMetaRow}>
                <MaterialIcons name="location-on" size={16} color="#b388ff" />
                <Text style={styles.upNextMetaText}>{upNext.eventLocation || 'TBD'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Recommended for You */}
        <Text style={styles.sectionTitle}>Recommended</Text>
        {recommended.length === 0 ? (
          <Text style={styles.loadingText}>Không có gợi ý thêm</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recommendedScroll}
          >
            {recommended.map((event) => (
              <TouchableOpacity 
                key={event.eventId}
                onPress={() => navigation.navigate('EventDetail', { eventId: event.eventId })}
                style={styles.recommendedCard}
              >
                <ImageBackground
                  source={{ uri: event.eventImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' }}
                  style={styles.recommendedImage}
                >
                  <View style={styles.recommendedFavorite}>
                    <MaterialIcons name="favorite-border" size={16} color="#d500f9" />
                  </View>
                </ImageBackground>
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedTitle} numberOfLines={1}>{event.eventName || 'Event'}</Text>
                  <Text style={styles.recommendedPrice}>
                    {typeof event.minPrice === 'number' && event.minPrice > 0 ? `From $${event.minPrice}` : 'Price TBD'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0014',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#1a0033',
    borderBottomWidth: 1,
    borderBottomColor: '#4d0099',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#d500f9',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  helloText: {
    fontSize: 12,
    color: '#b388ff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2a004d',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4d0099',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00e5ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
  },
  quickActionDiscover: {
    backgroundColor: '#1a0033',
    borderColor: '#4d0099',
  },
  quickActionTickets: {
    backgroundColor: '#2a004d',
    borderColor: '#00e5ff',
  },
  quickActionText: {
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d500f9',
  },
  upNextCard: {
    width: '100%',
    backgroundColor: '#1a0033',
    borderWidth: 1,
    borderColor: '#d500f9',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  upNextImage: {
    width: '100%',
    height: 128,
    justifyContent: 'flex-end',
    padding: 16,
  },
  upNextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,0,20,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d500f9',
  },
  upNextBadgeText: {
    color: '#d500f9',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  upNextInfoWrapper: {
    padding: 16,
    position: 'relative',
  },
  upNextQrWrapper: {
    position: 'absolute',
    top: -24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#1a0033',
  },
  upNextTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    paddingRight: 56,
  },
  upNextMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  upNextMetaText: {
    fontSize: 12,
    color: '#b388ff',
    marginLeft: 8,
  },
  recommendedScroll: {
    marginBottom: 32,
  },
  recommendedCard: {
    width: 192,
    backgroundColor: '#1a0033',
    borderWidth: 1,
    borderColor: '#4d0099',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  recommendedImage: {
    width: '100%',
    height: 128,
    justifyContent: 'space-between',
    padding: 12,
  },
  recommendedFavorite: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10,0,20,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d500f9',
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedTitle: {
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendedPrice: {
    color: '#00e5ff',
    fontWeight: '700',
    fontSize: 13,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#b388ff',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff6b6b',
    textAlign: 'center',
  },
});
