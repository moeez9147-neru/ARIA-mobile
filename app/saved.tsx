import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { theme } from '../config/theme';
import { useOfflineReports } from '../hooks/useOfflineReports';

function AnimatedCard({ children, delay = 0, style }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function SavedReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { getSavedReports } = useOfflineReports();

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      console.log('SAVED REPORTS RESPONSE:', JSON.stringify(data, null, 2));
      if (data.success) {
        setReports(data.reports);
        setIsOffline(false);
      } else {
        const offline = await getSavedReports();
        setReports(offline);
        setIsOffline(true);
      }
    } catch {
      const offline = await getSavedReports();
      setReports(offline);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (item: any) => {
    try {
      const dateStr = item.createdAt || item.updatedAt || item.date || item.timestamp;
      if (!dateStr) return 'Recently generated';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently generated';
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Recently generated';
    }
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <Animated.View style={{
        opacity: headerFade,
        transform: [{ translateY: headerSlide }],
      }}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={s.pageLabel}>YOUR HISTORY</Text>
        <Text style={s.title}>Saved{'\n'}Reports.</Text>
        <View style={s.divider} />
      </Animated.View>

      {isOffline && (
        <Animated.View style={[s.offlineBadge, { opacity: headerFade }]}>
          <Animated.View style={[s.offlineDot, { opacity: pulseAnim }]} />
          <Text style={s.offlineText}>OFFLINE MODE — showing cached reports</Text>
        </Animated.View>
      )}

      {loading ? (
        <View style={s.loaderWrap}>
          <ActivityIndicator color={theme.teal} size="large" />
          <Text style={s.loaderText}>Loading reports...</Text>
        </View>
      ) : reports.length === 0 ? (
        <Animated.View style={[s.emptyState, { opacity: headerFade }]}>
          <View style={s.emptyIcon}>
            <Text style={s.emptyIconText}>◈</Text>
          </View>
          <Text style={s.emptyTitle}>No reports yet.</Text>
          <Text style={s.emptySub}>
            Generate your first intelligence report to see it here.
          </Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={s.ctaBtnText}>Start Researching →</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item: any) => item._id || item.id || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: any) => (
            <AnimatedCard delay={index * 80} style={s.card}>
              <TouchableOpacity
                style={s.cardInner}
                onPress={() => router.push({
                  pathname: '/report',
                  params: {
                    report: JSON.stringify({ ...item, _id: item._id || item.id }),
                    query: item.query || '',
                  },
                })}
                activeOpacity={0.8}
              >
                <Text style={s.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={s.cardBody}>
                  <Text style={s.cardLabel}>REPORT</Text>
                  <Text style={s.cardQuery} numberOfLines={2}>
                    {item.query || 'Untitled report'}
                  </Text>
                  <Text style={s.cardDate}>{formatDate(item)}</Text>
                </View>
                <View style={s.cardArrowWrap}>
                  <Text style={s.cardArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          )}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C', paddingHorizontal: 24, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  backText: { fontSize: 10, color: '#0FCFBC', letterSpacing: 3, fontFamily: 'Outfit_600SemiBold' },
  pageLabel: { color: '#0FCFBC', fontSize: 10, fontFamily: 'Outfit_600SemiBold', letterSpacing: 3, marginBottom: 6 },
  title: { fontSize: 46, color: '#FAFAFA', fontFamily: 'PlayfairDisplay_900Black', lineHeight: 52, marginBottom: 8 },
  divider: { width: 40, height: 1.5, backgroundColor: '#0FCFBC', marginBottom: 24 },
  offlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(15,207,188,0.08)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.25)',
    borderRadius: 6, padding: 10, marginBottom: 16,
  },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0FCFBC' },
  offlineText: { color: '#0FCFBC', fontSize: 10, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { color: '#5A6A7E', fontSize: 13, fontFamily: 'Outfit_400Regular' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: 'rgba(15,207,188,0.08)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyIconText: { color: '#0FCFBC', fontSize: 28 },
  emptyTitle: { color: '#FAFAFA', fontSize: 26, fontFamily: 'PlayfairDisplay_900Black', marginBottom: 10 },
  emptySub: {
    color: '#5A6A7E', fontSize: 14, fontFamily: 'Outfit_400Regular',
    textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 24,
  },
  ctaBtn: { backgroundColor: '#0FCFBC', borderRadius: 50, paddingHorizontal: 32, paddingVertical: 15 },
  ctaBtnText: { color: '#08090C', fontSize: 14, fontFamily: 'Outfit_600SemiBold' },
  card: {
    backgroundColor: '#0E1117', borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.12)', marginBottom: 10, overflow: 'hidden',
  },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  cardIndex: { color: '#0FCFBC', fontSize: 20, fontFamily: 'PlayfairDisplay_900Black', opacity: 0.35, minWidth: 30 },
  cardBody: { flex: 1 },
  cardLabel: { color: '#0FCFBC', fontSize: 9, fontFamily: 'Outfit_600SemiBold', letterSpacing: 3, marginBottom: 5 },
  cardQuery: { color: '#FAFAFA', fontSize: 15, fontFamily: 'Outfit_500Medium', marginBottom: 5, lineHeight: 20 },
  cardDate: { color: '#5A6A7E', fontSize: 11, fontFamily: 'Outfit_300Light' },
  cardArrowWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(15,207,188,0.08)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardArrow: { color: '#0FCFBC', fontSize: 18 },
});