import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { EventLayout, LayoutAPI } from '../../services/layoutApiService';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContextType';

export default function UserScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [events, setEvents] = useState<EventLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadEvents = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      setError(null);
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await LayoutAPI.listLayouts();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const msg = e?.message || 'Không tải được danh sách sự kiện';
      setError(msg);
      if (mode === 'initial') {
        setEvents([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshUser();
    }, [refreshUser])
  );

  useEffect(() => {
    void loadEvents('initial');
  }, [loadEvents]);

  const onRefresh = useCallback(() => {
    void refreshUser();
    void loadEvents('refresh');
  }, [loadEvents, refreshUser]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((ev) => {
      const name = (ev.eventName || '').toLowerCase();
      const loc = (ev.eventLocation || '').toLowerCase();
      return name.includes(q) || loc.includes(q);
    });
  }, [events, query]);

  const { upNext, recommended } = useMemo(() => {
    if (!filteredEvents.length) return { upNext: null as EventLayout | null, recommended: [] as EventLayout[] };

    const now = new Date();
    const withDate = filteredEvents
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
    const remaining = filteredEvents.filter((e) => !next || e.eventId !== next.eventId);

    return { upNext: next, recommended: remaining.slice(0, 10) };
  }, [filteredEvents]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatarWrapper, { borderColor: colors.accent }]}
          >
            <ImageBackground 
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=68' }} 
              style={styles.avatarImage}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.helloText, { color: colors.textSecondary }]}>Hello,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={[styles.notificationButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <MaterialIcons name="notifications-none" size={24} color={colors.accent} />
          <View style={[styles.notificationDot, { backgroundColor: colors.accentSecondary }]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('AIAssistant')}
        style={[styles.floatingAIButton, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
        activeOpacity={0.8}
      >
        <MaterialIcons name="smart-toy" size={28} color="white" />
      </TouchableOpacity>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search events, artists, venues..."
            placeholderTextColor={colors.textSecondary + '80'}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {!query && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Up Next</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tickets')}>
                <Text style={[styles.sectionAction, { color: colors.accent }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải sự kiện...</Text>
              </View>
            ) : error ? (
              <View style={styles.loadingBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : !upNext ? (
              <View style={styles.loadingBox}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chưa có sự kiện sắp diễn ra</Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => navigation.navigate('EventDetail', { eventId: upNext.eventId })}
                style={[styles.upNextCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}
              >
                <ImageBackground
                  source={{ uri: upNext.eventImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' }}
                  style={styles.upNextImage}
                >
                  <View style={[styles.upNextBadge, { borderColor: colors.accent }]}>
                    <Text style={[styles.upNextBadgeText, { color: colors.accent }]}>Upcoming</Text>
                  </View>
                </ImageBackground>
                
                <View style={styles.upNextInfoWrapper}>
                  <View style={[styles.upNextQrWrapper, { backgroundColor: colors.accentSecondary, borderColor: colors.surface }]}>
                    <MaterialIcons name="qr-code-2" size={24} color={colors.background} />
                  </View>
                  
                  <Text style={[styles.upNextTitle, { color: colors.text }]}>{upNext.eventName || 'Event'}</Text>
                  
                  <View style={styles.upNextMetaRow}>
                    <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
                    <Text style={[styles.upNextMetaText, { color: colors.textSecondary }]}>
                      {upNext.eventDate ? new Date(upNext.eventDate).toLocaleTimeString() : 'TBD'}
                    </Text>
                  </View>
                  
                  <View style={styles.upNextMetaRow}>
                    <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
                    <Text style={[styles.upNextMetaText, { color: colors.textSecondary }]}>{upNext.eventLocation || 'TBD'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{query ? 'Search Results' : 'Recommended'}</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : filteredEvents.length === 0 ? (
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Không tìm thấy sự kiện nào</Text>
        ) : query ? (
          <View style={styles.searchResultsGrid}>
            {filteredEvents.map((ev) => (
              <TouchableOpacity
                key={ev.eventId}
                onPress={() => navigation.navigate('EventDetail', { eventId: ev.eventId })}
                style={[styles.searchResultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <ImageBackground
                  source={{ uri: ev.eventImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30' }}
                  style={styles.searchResultImage}
                >
                  <View style={styles.searchResultBadge}>
                    <Text style={[styles.searchResultPrice, { color: colors.accentSecondary }]}>${ev.minPrice || '--'}</Text>
                  </View>
                </ImageBackground>
                <View style={styles.searchResultInfo}>
                  <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={1}>{ev.eventName}</Text>
                  <Text style={[styles.searchResultMeta, { color: colors.textSecondary }]} numberOfLines={1}>{ev.eventLocation}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
                style={[styles.recommendedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <ImageBackground
                  source={{ uri: event.eventImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' }}
                  style={styles.recommendedImage}
                >
                  <View style={[styles.recommendedFavorite, { borderColor: colors.accent }]}>
                    <MaterialIcons name="favorite-border" size={16} color={colors.accent} />
                  </View>
                </ImageBackground>
                <View style={styles.recommendedInfo}>
                  <Text style={[styles.recommendedTitle, { color: colors.text }]} numberOfLines={1}>{event.eventName || 'Event'}</Text>
                  <Text style={[styles.recommendedPrice, { color: colors.accentSecondary }]}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
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
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingBottom: 80,
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
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  upNextCard: {
    width: '100%',
    borderWidth: 1,
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
  },
  upNextBadgeText: {
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
  upNextTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    marginLeft: 8,
  },
  recommendedScroll: {
    marginBottom: 32,
  },
  recommendedCard: {
    width: 192,
    borderWidth: 1,
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
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendedPrice: {
    fontWeight: '700',
    fontSize: 13,
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchResultCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  searchResultImage: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
  },
  searchResultBadge: {
    backgroundColor: 'rgba(10,0,20,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  searchResultPrice: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchResultInfo: {
    padding: 8,
  },
  searchResultTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchResultMeta: {
    fontSize: 10,
    marginTop: 2,
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
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff6b6b',
    textAlign: 'center',
  },
  floatingAIButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
