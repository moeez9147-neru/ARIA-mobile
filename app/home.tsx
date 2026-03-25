import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, FlatList,
  KeyboardAvoidingView, Platform,
  StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const STAGES = [
  { label: 'Scanning market data...', icon: '◈' },
  { label: 'Identifying competitors...', icon: '◎' },
  { label: 'Profiling your audience...', icon: '◉' },
  { label: 'Building content strategy...', icon: '◆' },
];

const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 260 + 10,
  y: Math.random() * 200 + 10,
  size: Math.random() * 5 + 2,
  color: i % 6 === 0 ? '#FF4D4D' : i % 4 === 0 ? '#FF8C42' : '#0FCFBC',
  opacity: Math.random() * 0.7 + 0.3,
  speed: Math.random() * 2500 + 1200,
  orbitRadius: Math.random() * 12 + 4,
}));

const CONNECTIONS = [
  [0,3],[1,5],[2,7],[3,8],[4,9],[5,11],[6,12],[7,13],
  [8,15],[9,16],[10,17],[11,18],[12,19],[13,20],[14,21],
  [15,22],[16,23],[3,25],[5,27],[7,29],[9,31],[11,33],
  [2,14],[4,16],[6,18],[8,20],[10,22],[12,24],[0,30],
];

const BG_DOTS = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height * 0.6,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 4000 + 3000,
  opacity: Math.random() * 0.15 + 0.05,
}));

function BackgroundField() {
  const anims = useRef(BG_DOTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: BG_DOTS[i].speed, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: BG_DOTS[i].speed, useNativeDriver: true }),
        ])
      );
      setTimeout(() => loop.start(), i * 150);
    });
  }, []);

  return (
    <View style={bgStyle.container} pointerEvents="none">
      {BG_DOTS.map((dot, i) => {
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [dot.opacity * 0.3, dot.opacity, dot.opacity * 0.3],
        });
        return (
          <Animated.View
            key={dot.id}
            style={{
              position: 'absolute',
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: '#0FCFBC',
              opacity,
            }}
          />
        );
      })}
      {/* Grid lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <View key={`h${i}`} style={[bgStyle.gridLine, bgStyle.gridH, { top: i * 80 }]} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <View key={`v${i}`} style={[bgStyle.gridLine, bgStyle.gridV, { left: i * (width / 4) }]} />
      ))}
    </View>
  );
}

function ParticleOrb() {
  const anims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotate entire orb
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true })
    ).start();

    // Pulse core
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Float particles
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: PARTICLES[i].speed, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: PARTICLES[i].speed, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a, i) => setTimeout(() => a.start(), i * 60));
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={orb.container}>
      {/* Connection lines */}
      {CONNECTIONS.map(([a, b], i) => {
        if (a >= PARTICLES.length || b >= PARTICLES.length) return null;
        const p1 = PARTICLES[a]; const p2 = PARTICLES[b];
        const dx = p2.x - p1.x; const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={i} style={[orb.line, {
            left: p1.x - 10,
            top: p1.y - 10,
            width: length,
            transform: [{ rotate: `${angle}deg` }],
            opacity: 0.12 + (i % 4) * 0.03,
          }]} />
        );
      })}

      {/* Particles */}
      {PARTICLES.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, p.id % 2 === 0 ? -p.orbitRadius : p.orbitRadius, 0],
        });
        const translateX = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, p.id % 3 === 0 ? -p.orbitRadius * 0.5 : p.orbitRadius * 0.5, 0],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.4, 0.6, 1],
          outputRange: [p.opacity * 0.5, p.opacity, p.opacity, p.opacity * 0.5],
        });
        return (
          <Animated.View
            key={p.id}
            style={[orb.dot, {
              left: p.x - 10,
              top: p.y - 10,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }],
              shadowColor: p.color,
              shadowOpacity: 0.8,
              shadowRadius: p.size,
            }]}
          />
        );
      })}

      {/* Core CPU */}
      <Animated.View style={[orb.coreWrap, { transform: [{ scale: pulseAnim }] }]}>
        <View style={orb.coreOuter}>
          <View style={orb.coreInner}>
            <Text style={orb.coreIcon}>◈</Text>
          </View>
          {/* Orbit ring */}
          <View style={orb.orbitRing} />
          {/* Pins */}
          <View style={[orb.pin, { top: 10, left: -8 }]} />
          <View style={[orb.pin, { top: 10, right: -8 }]} />
          <View style={[orb.pin, { bottom: 10, left: -8 }]} />
          <View style={[orb.pin, { bottom: 10, right: -8 }]} />
          <View style={[orb.pin, { top: -8, left: 10, width: 1.5, height: 8 }]} />
          <View style={[orb.pin, { bottom: -8, left: 10, width: 1.5, height: 8 }]} />
        </View>
      </Animated.View>

      {/* Scan line */}
      <View style={orb.scanLineWrap} pointerEvents="none">
        <ScanLine />
      </View>

      <Text style={orb.label}>ARIA INTELLIGENCE ENGINE  •  ALWAYS SCANNING</Text>
    </View>
  );
}

function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 2200, useNativeDriver: true })
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });
  return (
    <Animated.View style={[orb.scanLine, { transform: [{ translateY }] }]} />
  );
}

function TerminalBox() {
  const [text, setText] = useState('');
  const [cursor, setCursor] = useState(true);
  const barAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const full = '> Initialising ARIA engine...';
    let i = 0;
    const type = setInterval(() => {
      if (i < full.length) { setText(full.slice(0, i + 1)); i++; }
      else {
        clearInterval(type);
        setTimeout(() => {
          setText('> Ready. Awaiting input.');
        }, 800);
      }
    }, 80);
    const blink = setInterval(() => setCursor(c => !c), 500);
    Animated.loop(
      Animated.sequence([
        Animated.timing(barAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(barAnim, { toValue: 0.2, duration: 1800, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    return () => { clearInterval(type); clearInterval(blink); };
  }, []);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['15%', '85%'] });

  return (
    <View style={term.box}>
      <View style={term.header}>
        <View style={[term.dot, { backgroundColor: '#FF4D4D' }]} />
        <View style={[term.dot, { backgroundColor: '#FFB800' }]} />
        <View style={[term.dot, { backgroundColor: '#0FCFBC' }]} />
        <Text style={term.headerLabel}>aria_engine.sh</Text>
      </View>
      <Text style={term.text}>
        {text}
        <Animated.Text style={{ opacity: cursor ? 1 : 0, color: '#0FCFBC' }}>█</Animated.Text>
      </Text>
      <View style={term.progressRow}>
        <Text style={term.progressLabel}>INIT</Text>
        <View style={term.progressTrack}>
          <Animated.View style={[term.progressBar, { width: barWidth }]} />
        </View>
        <Text style={term.progressLabel}>READY</Text>
      </View>
      <View style={term.statusRow}>
        <Animated.View style={[term.statusDot, { opacity: glowAnim }]} />
        <Text style={term.statusText}>SYSTEM ONLINE  •  99.8% ACCURACY  •  &lt;30s RESULTS</Text>
      </View>
    </View>
  );
}

function ReportPreviewCard() {
  const lineAnims = useRef([0.4, 0.6, 0.5, 0.7].map(v => new Animated.Value(v))).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.timing(scoreAnim, { toValue: 82, duration: 1500, useNativeDriver: false }).start();
    lineAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.9, duration: 2000 + i * 300, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.3 + i * 0.1, duration: 2000 + i * 300, useNativeDriver: false }),
        ])
      ).start();
    });
  }, []);

  const BARS = [
    { label: 'MARKET SIZE', value: 0.85, color: '#0FCFBC' },
    { label: 'COMPETITION', value: 0.45, color: '#FF4D4D' },
    { label: 'GROWTH RATE', value: 0.72, color: '#0FCFBC' },
  ];

  const TAGS = ['PROPTECH', 'B2B SAAS', 'AI/ML'];

  return (
    <Animated.View style={[rp.container, { opacity: fadeAnim }]}>
      {/* Score */}
      <View style={rp.scoreRow}>
        <View style={rp.scoreCircle}>
          <Text style={rp.scoreNum}>82</Text>
          <Text style={rp.scoreLabel}>SCORE</Text>
        </View>
        <View style={rp.scoreInfo}>
          <Text style={rp.viability}>HIGH POTENTIAL</Text>
          <Text style={rp.viabilityDesc}>Market conditions favorable</Text>
          <View style={rp.tagRow}>
            {TAGS.map(tag => (
              <View key={tag} style={rp.tag}>
                <Text style={rp.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bars */}
      {BARS.map((bar, i) => (
        <View key={bar.label} style={rp.barRow}>
          <Text style={rp.barLabel}>{bar.label}</Text>
          <View style={rp.barTrack}>
            <Animated.View style={[rp.barFill, {
              backgroundColor: bar.color,
              width: lineAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', `${bar.value * 100}%`],
              }),
            }]} />
          </View>
        </View>
      ))}

      {/* Mini chart */}
      <View style={rp.chartRow}>
        {[4, 7, 5, 9, 6, 8, 7, 10, 8, 11].map((h, i) => (
          <View key={i} style={[rp.bar, {
            height: h * 4,
            backgroundColor: i % 2 === 0 ? '#0FCFBC' : '#FF4D4D',
            opacity: 0.6 + i * 0.04,
          }]} />
        ))}
      </View>

      <View style={rp.footer}>
        <View style={rp.verifiedDot} />
        <Text style={rp.footerText}>VERIFIED DATA  •  REAL-TIME ANALYSIS</Text>
      </View>
    </Animated.View>
  );
}

function AnimatedCard({ children, delay = 0, style }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!loading) { scanAnim.setValue(0); return; }
    setStageIndex(0);
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
    ).start();
    const interval = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, STAGES.length - 1));
    }, 2600);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!query.trim() || loading) return;
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
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
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.report) {
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        router.push({ pathname: '/report', params: { report: JSON.stringify(data.report), query } });
      } else {
        setError(data.message || 'Failed to generate report. Please try again.');
      }
    } catch (e) {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const scanTranslate = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-2, 160] });

  return (
    <View style={{ flex: 1, backgroundColor: '#08090C' }}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />
      <BackgroundField />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <Animated.View style={[s.header, { opacity: headerAnim }]}>
          <View style={s.logoRow}>
            <View style={s.logoIcon}>
              <Text style={s.logoSymbol}>◈</Text>
            </View>
            <View>
              <Text style={s.logoText}>ARIA</Text>
              <Text style={s.logoSub}>INTELLIGENCE ENGINE</Text>
            </View>
          </View>
          <TouchableOpacity style={s.savedBtn} onPress={() => router.push('/saved')}>
            <Text style={s.savedBtnText}>SAVED →</Text>
          </TouchableOpacity>
        </Animated.View>

        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{ backgroundColor: '#08090C', paddingBottom: 40 }}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 20 }}>

              {/* Hero */}
              <AnimatedCard delay={0}>
                <View style={s.heroBadge}>
                  <View style={s.heroBadgeDot} />
                  <Text style={s.heroBadgeText}>STEP 01 / 03  •  AI POWERED</Text>
                </View>
                <Text style={s.heroH1}>Understand</Text>
                <Text style={s.heroH2}>Your Market.</Text>
                <Text style={s.heroSub}>
                  Stop relying on guesswork. Type in a business idea, and ARIA gathers the exact data you need to succeed in under 30 seconds.
                </Text>
                {/* Decorative corners */}
                <View style={[s.corner, s.cornerTL]} />
                <View style={[s.corner, s.cornerTR]} />
              </AnimatedCard>

              {/* Step 01 */}
              <AnimatedCard delay={200} style={s.stepCard}>
                <View style={s.stepNumRow}>
                  <Text style={s.stepNum}>STEP 01</Text>
                  <View style={s.stepPill}><Text style={s.stepPillText}>YOUR IDEA</Text></View>
                </View>
                <Text style={s.stepTitle}>Your Idea.</Text>
                <Text style={s.stepDesc}>
                  Type your business idea. ARIA reads it and begins scanning immediately.
                </Text>
                <TerminalBox />
              </AnimatedCard>

              {/* Step 02 */}
              <AnimatedCard delay={350} style={s.stepCard}>
                <View style={s.stepNumRow}>
                  <Text style={s.stepNum}>STEP 02</Text>
                  <View style={[s.stepPill, { borderColor: 'rgba(255,77,77,0.3)' }]}>
                    <Text style={[s.stepPillText, { color: '#FF4D4D' }]}>ARIA BRAIN</Text>
                  </View>
                </View>
                <Text style={s.stepTitle}>Research.</Text>
                <ParticleOrb />
              </AnimatedCard>

              {/* Step 03 */}
              <AnimatedCard delay={500} style={s.stepCard}>
                <View style={s.stepNumRow}>
                  <Text style={s.stepNum}>STEP 03</Text>
                  <View style={[s.stepPill, { borderColor: 'rgba(15,207,188,0.5)', backgroundColor: 'rgba(15,207,188,0.08)' }]}>
                    <Text style={[s.stepPillText, { color: '#0FCFBC' }]}>YOUR REPORT</Text>
                  </View>
                </View>
                <Text style={s.stepTitle}>Get Results.</Text>
                <Text style={s.stepDesc}>
                  A professional intelligence report with everything you need to dominate your market.
                </Text>
                <ReportPreviewCard />
              </AnimatedCard>

              {/* Search */}
              <AnimatedCard delay={650} style={s.searchCard}>
                <View style={s.searchTopRow}>
                  <Text style={s.searchLabel}>{'>'} DESCRIBE YOUR IDEA</Text>
                  <View style={s.searchBadge}>
                    <Animated.View style={[s.searchBadgeDot, { opacity: pulseAnim }]} />
                    <Text style={s.searchBadgeText}>LIVE</Text>
                  </View>
                </View>
                <TextInput
                  style={s.searchInput}
                  placeholder={'"AI for Real Estate"'}
                  placeholderTextColor="#3D4F63"
                  value={query}
                  onChangeText={setQuery}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                  textAlignVertical="top"
                />
                <View style={s.searchMeta}>
                  <Animated.View style={[s.dot, { opacity: pulseAnim }]} />
                  <Text style={s.searchMetaText}>
                    READY  |  99% ACCURACY  |  REAL-TIME DATA  |  &lt;30s
                  </Text>
                </View>
              </AnimatedCard>

              {/* Error */}
              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠  {error}</Text>
                </View>
              ) : null}

              {/* Loading */}
              {loading && (
                <View style={s.stagesCard}>
                  <Animated.View style={[s.scanLine, { transform: [{ translateY: scanTranslate }] }]} />
                  <View style={s.stagesHeader}>
                    <Text style={s.stagesQuery}>Analysing: {query}</Text>
                    <Animated.View style={[s.stagesPulse, { opacity: pulseAnim }]} />
                  </View>
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
                        {i < stageIndex ? `✓  ${stage.label}` : i === stageIndex ? `${stage.icon}  ${stage.label}` : `   ${stage.label}`}
                      </Text>
                      {i === stageIndex && <Animated.View style={[s.stageLiveDot, { opacity: pulseAnim }]} />}
                    </View>
                  ))}
                </View>
              )}

              {/* CTA */}
              {!loading && (
                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                  <TouchableOpacity
                    style={[s.ctaBtn, !query.trim() && s.ctaBtnDisabled]}
                    onPress={handleGenerate}
                    disabled={!query.trim()}
                    activeOpacity={0.88}
                  >
                    <Text style={s.ctaBtnText}>Generate Report  →</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Recent */}
              {recentSearches.length > 0 && !loading && (
                <View style={s.recentSection}>
                  <Text style={s.recentLabel}>RECENT SEARCHES</Text>
                  {recentSearches.map((item, i) => (
                    <TouchableOpacity key={i} style={s.recentItem} onPress={() => setQuery(item)}>
                      <Text style={s.recentIndex}>0{i + 1}</Text>
                      <Text style={s.recentText} numberOfLines={1}>{item}</Text>
                      <Text style={s.recentArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            </View>
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const bgStyle = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#08090C',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(15,207,188,0.03)',
  },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },
});

const orb = StyleSheet.create({
  container: {
    height: 280, position: 'relative',
    marginTop: 8, overflow: 'hidden',
  },
  line: {
    position: 'absolute', height: 1,
    backgroundColor: 'rgba(15,207,188,0.18)',
    transformOrigin: 'left center',
  },
  dot: { position: 'absolute' },
  coreWrap: {
    position: 'absolute',
    left: '50%', top: '40%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
  },
  coreOuter: {
    width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  coreInner: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: 'rgba(15,207,188,0.12)',
    borderWidth: 1.5, borderColor: '#0FCFBC',
    alignItems: 'center', justifyContent: 'center',
  },
  coreIcon: { color: '#0FCFBC', fontSize: 22 },
  orbitRing: {
    position: 'absolute', width: 72, height: 72,
    borderRadius: 36, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.15)',
    borderStyle: 'dashed',
  },
  pin: { position: 'absolute', backgroundColor: '#0FCFBC', width: 8, height: 1.5 },
  scanLineWrap: {
    position: 'absolute', left: 0, right: 0, top: 0, overflow: 'hidden', height: 240,
  },
  scanLine: {
    height: 2,
    backgroundColor: 'rgba(15,207,188,0.3)',
    shadowColor: '#0FCFBC',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  label: {
    position: 'absolute', bottom: 4, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(15,207,188,0.5)',
    fontSize: 9, fontFamily: 'Outfit_500Medium', letterSpacing: 2,
  },
});

const term = StyleSheet.create({
  box: {
    backgroundColor: '#060A0F', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.2)', marginTop: 14, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(15,207,188,0.04)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,207,188,0.1)',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  headerLabel: {
    color: 'rgba(15,207,188,0.4)', fontSize: 10,
    fontFamily: 'Outfit_400Regular', marginLeft: 8,
  },
  text: {
    color: '#0FCFBC', fontSize: 13, fontFamily: 'Outfit_600SemiBold',
    padding: 12, paddingBottom: 8, minHeight: 40,
  },
  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingBottom: 8,
  },
  progressLabel: { color: 'rgba(15,207,188,0.4)', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 },
  progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(15,207,188,0.1)', borderRadius: 2 },
  progressBar: { height: 3, backgroundColor: '#0FCFBC', borderRadius: 2 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(15,207,188,0.08)',
  },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#0FCFBC' },
  statusText: { color: 'rgba(15,207,188,0.35)', fontSize: 9, fontFamily: 'Outfit_500Medium', letterSpacing: 1 },
});

const rp = StyleSheet.create({
  container: {
    backgroundColor: '#060A0F', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.2)', padding: 14, marginTop: 14,
  },
  scoreRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  scoreCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: '#0FCFBC',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,207,188,0.08)',
  },
  scoreNum: { color: '#0FCFBC', fontSize: 20, fontFamily: 'PlayfairDisplay_900Black' },
  scoreLabel: { color: 'rgba(15,207,188,0.5)', fontSize: 7, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 },
  scoreInfo: { flex: 1, justifyContent: 'center' },
  viability: { color: '#0FCFBC', fontSize: 12, fontFamily: 'Outfit_600SemiBold', letterSpacing: 2, marginBottom: 2 },
  viabilityDesc: { color: '#5A6A7E', fontSize: 11, fontFamily: 'Outfit_400Regular', marginBottom: 6 },
  tagRow: { flexDirection: 'row', gap: 4 },
  tag: {
    backgroundColor: 'rgba(15,207,188,0.1)', borderRadius: 2,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    paddingHorizontal: 6, paddingVertical: 2,
  },
  tagText: { color: '#0FCFBC', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { color: '#5A6A7E', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1, width: 80 },
  barTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
  chartRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    marginTop: 10, height: 44, paddingHorizontal: 4,
  },
  bar: { flex: 1, borderRadius: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  verifiedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#0FCFBC', opacity: 0.6 },
  footerText: { color: 'rgba(15,207,188,0.35)', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1.5 },
});

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
    backgroundColor: '#08090C',
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,207,188,0.06)',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: 'rgba(15,207,188,0.1)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoSymbol: { color: '#0FCFBC', fontSize: 18 },
  logoText: { color: '#FAFAFA', fontSize: 20, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: 1 },
  logoSub: { color: 'rgba(15,207,188,0.5)', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 3 },
  savedBtn: {
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.25)',
    borderRadius: 4, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(15,207,188,0.05)',
  },
  savedBtnText: { color: '#0FCFBC', fontSize: 10, fontFamily: 'Outfit_600SemiBold', letterSpacing: 2 },

  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 28, marginBottom: 14,
  },
  heroBadgeDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#0FCFBC',
  },
  heroBadgeText: { color: '#0FCFBC', fontSize: 10, fontFamily: 'Outfit_600SemiBold', letterSpacing: 3 },
  heroH1: { color: '#FAFAFA', fontSize: 44, fontFamily: 'PlayfairDisplay_900Black', lineHeight: 50 },
  heroH2: { color: '#0FCFBC', fontSize: 44, fontFamily: 'PlayfairDisplay_900Black', lineHeight: 50, marginBottom: 16 },
  heroSub: { color: '#8898AA', fontSize: 14, fontFamily: 'Outfit_400Regular', lineHeight: 22, marginBottom: 8 },
  corner: { position: 'absolute', width: 16, height: 16, borderColor: 'rgba(15,207,188,0.3)' },
  cornerTL: { top: 28, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cornerTR: { bottom: 8, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 },

  stepCard: {
    backgroundColor: '#0A0F14', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.1)', padding: 18, marginBottom: 14,
  },
  stepNumRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepNum: { color: '#0FCFBC', fontSize: 9, fontFamily: 'Outfit_600SemiBold', letterSpacing: 3 },
  stepPill: {
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2,
  },
  stepPillText: { color: 'rgba(15,207,188,0.6)', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 2 },
  stepTitle: { color: '#FAFAFA', fontSize: 30, fontFamily: 'PlayfairDisplay_900Black', marginBottom: 8 },
  stepDesc: { color: '#8898AA', fontSize: 13, fontFamily: 'Outfit_400Regular', lineHeight: 20 },

  searchCard: {
    backgroundColor: '#0A0F14', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.2)', padding: 16, marginBottom: 14,
  },
  searchTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  searchLabel: { color: '#0FCFBC', fontSize: 10, fontFamily: 'Outfit_600SemiBold', letterSpacing: 2 },
  searchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(15,207,188,0.08)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    borderRadius: 2, paddingHorizontal: 6, paddingVertical: 3,
  },
  searchBadgeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0FCFBC' },
  searchBadgeText: { color: '#0FCFBC', fontSize: 8, fontFamily: 'Outfit_600SemiBold', letterSpacing: 2 },
  searchInput: {
    color: '#FAFAFA', fontSize: 15, fontFamily: 'Outfit_400Regular',
    backgroundColor: '#060A0F', borderRadius: 6, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.12)', padding: 14, minHeight: 90,
  },
  searchMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#0FCFBC' },
  searchMetaText: { color: '#3D4F63', fontSize: 9, fontFamily: 'Outfit_500Medium', letterSpacing: 1 },

  errorBox: {
    backgroundColor: 'rgba(255,77,77,0.08)', borderRadius: 6, borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.3)', padding: 12, marginBottom: 12,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, fontFamily: 'Outfit_400Regular' },

  stagesCard: {
    backgroundColor: '#0A0F14', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.25)', padding: 16, marginBottom: 14,
    overflow: 'hidden', position: 'relative',
  },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(15,207,188,0.35)',
    shadowColor: '#0FCFBC', shadowOpacity: 1, shadowRadius: 8,
  },
  stagesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  stagesQuery: { color: '#0FCFBC', fontSize: 11, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 },
  stagesPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0FCFBC' },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E2D3D' },
  stageDotActive: { backgroundColor: '#0FCFBC', width: 8, height: 8, borderRadius: 4 },
  stageDotDone: { backgroundColor: '#0FCFBC', opacity: 0.35 },
  stageLiveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#0FCFBC', marginLeft: 4 },
  stageText: { color: '#3D4F63', fontSize: 12, fontFamily: 'Outfit_400Regular', flex: 1 },
  stageTextActive: { color: '#0FCFBC', fontFamily: 'Outfit_600SemiBold' },
  stageTextDone: { color: '#5A6A7E' },

  ctaBtn: {
    backgroundColor: '#0FCFBC', borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 24,
    shadowColor: '#0FCFBC', shadowOpacity: 0.3, shadowRadius: 20,
  },
  ctaBtnDisabled: { opacity: 0.3, shadowOpacity: 0 },
  ctaBtnText: { color: '#08090C', fontSize: 16, fontFamily: 'Outfit_600SemiBold' },

  recentSection: { marginBottom: 16 },
  recentLabel: { color: '#3D4F63', fontSize: 9, fontFamily: 'Outfit_600SemiBold', letterSpacing: 3, marginBottom: 12 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: 'rgba(15,207,188,0.06)',
  },
  recentIndex: { color: 'rgba(15,207,188,0.3)', fontSize: 10, fontFamily: 'Outfit_600SemiBold', width: 20 },
  recentText: { color: '#E8EDF2', fontSize: 13, fontFamily: 'Outfit_400Regular', flex: 1 },
  recentArrow: { color: '#0FCFBC', fontSize: 12, fontFamily: 'Outfit_600SemiBold' },
});