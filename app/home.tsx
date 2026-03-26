import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions,
  KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const SUGGESTIONS = [
  'Fintech startups',
  'AI in healthcare',
  'DTC ecommerce trends',
  'SaaS productivity tools',
  'EV market in Europe',
  'Food delivery apps',
];

const STAGES = [
  { label: 'Scanning market data...', icon: '◈' },
  { label: 'Identifying competitors...', icon: '◎' },
  { label: 'Profiling your audience...', icon: '◉' },
  { label: 'Building content strategy...', icon: '◆' },
];

const BG_DOTS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2.5 + 1,
  speed: Math.random() * 5000 + 4000,
  opacity: Math.random() * 0.12 + 0.03,
  color: i % 5 === 0 ? '#FF4D4D' : '#0FCFBC',
}));

function AmbientBackground() {
  const anims = useRef(BG_DOTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    BG_DOTS.forEach((dot, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anims[i], { toValue: 1, duration: dot.speed, useNativeDriver: true }),
          Animated.timing(anims[i], { toValue: 0, duration: dot.speed, useNativeDriver: true }),
        ])
      );
      setTimeout(() => loop.start(), i * 200);
    });
  }, []);

  return (
    // ✅ FIX — pointerEvents moved inside style object
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' } as any]}>
      <View style={bg.glowCenter} />
      {Array.from({ length: 10 }, (_, i) => (
        <View key={`h${i}`} style={[bg.line, bg.lineH, { top: i * (height / 10) }]} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <View key={`v${i}`} style={[bg.line, bg.lineV, { left: i * (width / 5) }]} />
      ))}
      {BG_DOTS.map((dot, i) => {
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [dot.opacity * 0.3, dot.opacity, dot.opacity * 0.3],
        });
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, dot.id % 2 === 0 ? -20 : 20],
        });
        return (
          <Animated.View key={dot.id} style={{
            position: 'absolute', left: dot.x, top: dot.y,
            width: dot.size, height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: dot.color,
            opacity, transform: [{ translateY }],
          }} />
        );
      })}
    </View>
  );
}

function ObsidianBadge() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={badge.wrap}>
      <Animated.View style={[badge.dot, { opacity: pulseAnim }]} />
      <Text style={badge.text}>Obsidian Intelligence</Text>
    </View>
  );
}

function LoadingOrb({ stageIndex }: { stageIndex: number }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(ring1, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(ring2, { toValue: 1, duration: 4500, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinReverse = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const scanY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 0, 0] });
  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 0, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] });

  return (
    <View style={orb.container}>
      <Animated.View style={[orb.ripple, { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]} />
      <Animated.View style={[orb.ripple, { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />
      <Animated.View style={[orb.outerRing, { transform: [{ rotate: spin }] }]}>
        <View style={orb.outerRingDot1} />
        <View style={orb.outerRingDot2} />
        <View style={orb.outerRingDot3} />
      </Animated.View>
      <Animated.View style={[orb.middleRing, { transform: [{ rotate: spinReverse }] }]}>
        <View style={orb.middleRingDash1} />
        <View style={orb.middleRingDash2} />
      </Animated.View>
      <Animated.View style={[orb.core, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={orb.coreIcon}>◈</Text>
      </Animated.View>
      <View style={orb.scanWrap}>
        <Animated.View style={[orb.scanLine, { transform: [{ translateY: scanY }] }]} />
      </View>
      <Text style={orb.stageText}>
        {STAGES[stageIndex]?.icon}  {STAGES[stageIndex]?.label}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const inputBorder = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(contentSlide, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  useEffect(() => {
    Animated.timing(inputBorder, {
      toValue: inputFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [inputFocused]);

  useEffect(() => {
    if (!loading) return;
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, STAGES.length - 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim() || loading) return;
    if (q) setQuery(q);
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setLoading(true);
    setError('');
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.report) {
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        router.push({
          pathname: '/report',
          params: { report: JSON.stringify(data.report), query: searchQuery },
        });
      } else {
        setError(data.message || 'Failed to generate report. Please try again.');
      }
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const borderColor = inputBorder.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(15,207,188,0.15)', 'rgba(15,207,188,0.7)'],
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />
      <AmbientBackground />

      {/* Header */}
      <Animated.View style={[s.header, { opacity: headerFade }]}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}>
            <Text style={s.logoSymbol}>◈</Text>
          </View>
          <Text style={s.logoText}>ARIA</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.sessionBadge}>
            <View style={s.sessionDot} />
            <Text style={s.sessionText}>Session Active</Text>
          </View>
          <TouchableOpacity
            style={s.signOutBtn}
            onPress={async () => {
              await SecureStore.deleteItemAsync('token');
              router.replace('/login' as any);
            }}
          >
            <Text style={s.signOutText}>→ Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {loading ? (
            <Animated.View style={[s.loadingWrap, { opacity: contentFade }]}>
              <LoadingOrb stageIndex={stageIndex} />
              <Text style={s.loadingTitle}>Analysing your market</Text>
              <Text style={s.loadingQuery}>"{query}"</Text>
              <View style={s.stagesList}>
                {STAGES.map((stage, i) => (
                  <View key={stage.label} style={s.stageRow}>
                    <View style={[
                      s.stageDot,
                      i < stageIndex && s.stageDotDone,
                      i === stageIndex && s.stageDotActive,
                    ]} />
                    <Text style={[
                      s.stageText,
                      i === stageIndex && s.stageTextActive,
                      i < stageIndex && s.stageTextDone,
                    ]}>
                      {i < stageIndex
                        ? `✓  ${stage.label}`
                        : `${stage.icon}  ${stage.label}`}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={s.loadingEta}>Estimated time: 15–30 seconds</Text>
            </Animated.View>
          ) : (
            <Animated.View style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}>
              {/* Badge */}
              <View style={s.badgeWrap}>
                <ObsidianBadge />
              </View>

              {/* Hero */}
              <Text style={s.heroTitle}>
                What market are you{'\n'}researching?
              </Text>

              {/* Search */}
              <Animated.View style={[s.searchWrap, { borderColor }]}>
                <Text style={s.searchIcon}>⌕</Text>
                <TextInput
                  style={s.searchInput}
                  placeholder="e.g. Electric Vehicle market in Europe..."
                  placeholderTextColor="#3D4F63"
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onSubmitEditing={() => handleGenerate()}
                  returnKeyType="search"
                  editable={!loading}
                  multiline={false}
                />
                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                  <TouchableOpacity
                    style={[s.generateBtn, !query.trim() && s.generateBtnDisabled]}
                    onPress={() => handleGenerate()}
                    disabled={!query.trim()}
                    activeOpacity={0.85}
                  >
                    <Text style={s.generateBtnText}>Generate</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>

              {/* Error */}
              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠  {error}</Text>
                </View>
              ) : null}

              {/* Suggestions */}
              <Text style={s.suggestLabel}>Try searching for</Text>
              <View style={s.suggestRow}>
                {SUGGESTIONS.map((sug, i) => (
                  <TouchableOpacity
                    key={i}
                    style={s.suggestPill}
                    onPress={() => handleGenerate(sug)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.suggestText}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <>
                  <View style={s.divider} />
                  <Text style={s.recentLabel}>RECENT SEARCHES</Text>
                  {recentSearches.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={s.recentItem}
                      onPress={() => handleGenerate(item)}
                      activeOpacity={0.75}
                    >
                      <Text style={s.recentIcon}>↻</Text>
                      <Text style={s.recentText} numberOfLines={1}>{item}</Text>
                      <Text style={s.recentArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Stats strip */}
              <View style={s.statsStrip}>
                {[
                  { val: '<30s', label: 'Report time' },
                  { val: '4', label: 'Sections' },
                  { val: '99%', label: 'Accuracy' },
                  { val: '∞', label: 'Free' },
                ].map((stat, i) => (
                  <View key={i} style={s.statItem}>
                    <Text style={s.statVal}>{stat.val}</Text>
                    <Text style={s.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Saved reports link */}
              <View style={s.bottomNav}>
                <TouchableOpacity
                  style={s.navItem}
                  onPress={() => router.push('/saved')}
                  activeOpacity={0.8}
                >
                  <Text style={s.navIcon}>☰</Text>
                  <Text style={s.navText}>Saved Reports</Text>
                  <Text style={s.navArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const bg = StyleSheet.create({
  glowCenter: {
    position: 'absolute',
    width: width * 1.2, height: height * 0.5,
    top: height * 0.1, left: -width * 0.1,
    borderRadius: width,
    backgroundColor: 'rgba(15,207,188,0.025)',
  },
  line: { position: 'absolute', backgroundColor: 'rgba(15,207,188,0.03)' },
  lineH: { left: 0, right: 0, height: 1 },
  lineV: { top: 0, bottom: 0, width: 1 },
});

const badge = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,207,188,0.07)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0FCFBC' },
  text: {
    color: 'rgba(15,207,188,0.8)', fontSize: 12,
    fontFamily: 'Outfit_500Medium', letterSpacing: 0.5,
  },
});

const orb = StyleSheet.create({
  container: {
    alignItems: 'center', justifyContent: 'center',
    height: 200, marginBottom: 32,
  },
  ripple: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    borderWidth: 1.5, borderColor: '#0FCFBC',
  },
  outerRing: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  outerRingDot1: {
    position: 'absolute', top: -4, left: '50%',
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#0FCFBC',
  },
  outerRingDot2: {
    position: 'absolute', bottom: -4, right: '30%',
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#FF4D4D',
  },
  outerRingDot3: {
    position: 'absolute', left: -4, top: '40%',
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#0FCFBC', opacity: 0.6,
  },
  middleRing: {
    position: 'absolute', width: 95, height: 95, borderRadius: 48,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  middleRingDash1: {
    position: 'absolute', top: 0, left: '45%',
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(15,207,188,0.5)',
  },
  middleRingDash2: {
    position: 'absolute', bottom: 0, right: '45%',
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,77,77,0.5)',
  },
  core: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: 'rgba(15,207,188,0.1)',
    borderWidth: 1.5, borderColor: '#0FCFBC',
    alignItems: 'center', justifyContent: 'center',
  },
  coreIcon: { color: '#0FCFBC', fontSize: 26 },
  scanWrap: {
    position: 'absolute', width: 64, height: 64,
    overflow: 'hidden', borderRadius: 14,
  },
  scanLine: {
    width: '100%', height: 2,
    backgroundColor: 'rgba(15,207,188,0.5)',
  },
  stageText: {
    color: 'rgba(15,207,188,0.6)', fontSize: 11,
    fontFamily: 'Outfit_500Medium', letterSpacing: 1,
    marginTop: 16, textAlign: 'center',
  },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,207,188,0.06)',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(15,207,188,0.1)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoSymbol: { color: '#0FCFBC', fontSize: 17 },
  logoText: {
    color: '#FAFAFA', fontSize: 20,
    fontFamily: 'PlayfairDisplay_900Black', letterSpacing: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sessionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0FCFBC' },
  sessionText: { color: '#0FCFBC', fontSize: 11, fontFamily: 'Outfit_500Medium' },
  signOutBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6,
  },
  signOutText: { color: '#8898AA', fontSize: 11, fontFamily: 'Outfit_500Medium' },

  scroll: {
    paddingHorizontal: 24, paddingTop: 48,
    paddingBottom: 60, flexGrow: 1,
  },
  badgeWrap: { marginBottom: 28 },
  heroTitle: {
    color: '#FAFAFA', fontSize: 36,
    fontFamily: 'PlayfairDisplay_900Black',
    lineHeight: 44, textAlign: 'center', marginBottom: 36,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0A0F14',
    borderRadius: 14, borderWidth: 1.5,
    paddingLeft: 16, paddingRight: 8, paddingVertical: 8,
    marginBottom: 14, gap: 10,
  },
  searchIcon: { color: '#0FCFBC', fontSize: 20 },
  searchInput: {
    flex: 1, color: '#FAFAFA', fontSize: 15,
    fontFamily: 'Outfit_400Regular', paddingVertical: 8,
  },
  generateBtn: {
    backgroundColor: '#0FCFBC', borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 12,
  },
  generateBtnDisabled: { opacity: 0.35 },
  generateBtnText: {
    color: '#08090C', fontSize: 14, fontFamily: 'Outfit_600SemiBold',
  },

  errorBox: {
    backgroundColor: 'rgba(255,77,77,0.08)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,77,77,0.25)',
    padding: 12, marginBottom: 16,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, fontFamily: 'Outfit_400Regular' },

  suggestLabel: {
    color: '#5A6A7E', fontSize: 12, fontFamily: 'Outfit_400Regular',
    textAlign: 'center', marginBottom: 16,
  },
  suggestRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, justifyContent: 'center', marginBottom: 36,
  },
  suggestPill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9,
  },
  suggestText: { color: '#E8EDF2', fontSize: 13, fontFamily: 'Outfit_400Regular' },

  divider: {
    height: 1, backgroundColor: 'rgba(15,207,188,0.08)', marginBottom: 20,
  },
  recentLabel: {
    color: '#3D4F63', fontSize: 9, fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 3, marginBottom: 14,
  },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  recentIcon: { color: '#0FCFBC', fontSize: 15 },
  recentText: {
    flex: 1, color: '#8898AA', fontSize: 13, fontFamily: 'Outfit_400Regular',
  },
  recentArrow: { color: '#3D4F63', fontSize: 13 },

  statsStrip: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#0A0F14', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.08)',
    padding: 16, marginTop: 36, marginBottom: 16,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: {
    color: '#0FCFBC', fontSize: 20,
    fontFamily: 'PlayfairDisplay_900Black', marginBottom: 4,
  },
  statLabel: {
    color: '#5A6A7E', fontSize: 10,
    fontFamily: 'Outfit_400Regular', textAlign: 'center',
  },

  bottomNav: {
    marginTop: 8, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.08)', overflow: 'hidden',
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0A0F14', padding: 16,
  },
  navIcon: { color: '#0FCFBC', fontSize: 16 },
  navText: { flex: 1, color: '#E8EDF2', fontSize: 14, fontFamily: 'Outfit_500Medium' },
  navArrow: { color: '#3D4F63', fontSize: 14 },

  loadingWrap: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingTop: 40,
  },
  loadingTitle: {
    color: '#FAFAFA', fontSize: 22,
    fontFamily: 'PlayfairDisplay_900Black',
    textAlign: 'center', marginBottom: 8,
  },
  loadingQuery: {
    color: '#0FCFBC', fontSize: 14, fontFamily: 'Outfit_400Regular',
    textAlign: 'center', marginBottom: 36,
  },
  stagesList: { width: '100%', gap: 14, marginBottom: 24 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E2D3D' },
  stageDotActive: { backgroundColor: '#0FCFBC', width: 8, height: 8, borderRadius: 4 },
  stageDotDone: { backgroundColor: '#0FCFBC', opacity: 0.35 },
  stageText: {
    color: '#3D4F63', fontSize: 13,
    fontFamily: 'Outfit_400Regular', flex: 1,
  },
  stageTextActive: { color: '#0FCFBC', fontFamily: 'Outfit_600SemiBold' },
  stageTextDone: { color: '#5A6A7E' },
  loadingEta: {
    color: '#3D4F63', fontSize: 11, fontFamily: 'Outfit_400Regular',
    letterSpacing: 0.5, textAlign: 'center',
  },
});