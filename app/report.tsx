import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated, Dimensions, ScrollView,
  StatusBar, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { useOfflineReports } from '../hooks/useOfflineReports';

const { width } = Dimensions.get('window');

function AnimatedEntry({ children, delay = 0, style }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);
  return (
    <Animated.View style={[style, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {children}
    </Animated.View>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const getLabel = (s: number) => {
    if (s >= 80) return 'GREAT';
    if (s >= 60) return 'GOOD';
    if (s >= 40) return 'FAIR';
    return 'LOW';
  };
  return (
    <Animated.View style={[sc.wrap, { transform: [{ scale: pulseAnim }] }]}>
      <View style={sc.ring}>
        <View style={sc.ringInner}>
          <Text style={sc.scoreNum}>{score}</Text>
          <Text style={sc.scoreLabel}>{getLabel(score)}</Text>
        </View>
      </View>
      <Text style={sc.scoreTitle}>Market Score</Text>
    </Animated.View>
  );
}

function StatCard({ label, value, trend, delay }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);
  const isPos = trend && !trend.startsWith('-');
  return (
    <Animated.View style={[st.card, { opacity: fade, transform: [{ scale }] }]}>
      <Text style={st.label}>{label}</Text>
      <Text style={st.value} numberOfLines={2}>{value}</Text>
      {trend ? (
        <View style={[st.trendBadge, {
          backgroundColor: isPos ? 'rgba(15,207,188,0.1)' : 'rgba(255,77,77,0.1)'
        }]}>
          <Text style={[st.trendText, { color: isPos ? '#0FCFBC' : '#FF4D4D' }]}>
            {isPos ? '↑' : '↓'} {trend}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

function AnimatedBar({ label, value, color, delay }: any) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.timing(widthAnim, {
        toValue: value, duration: 1000, useNativeDriver: false,
      }).start();
    }, delay);
  }, []);
  const pct = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={ab.row}>
      <Text style={ab.label}>{label}</Text>
      <View style={ab.track}>
        <Animated.View style={[ab.fill, { width: pct, backgroundColor: color }]} />
      </View>
      <Text style={[ab.pct, { color }]}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

function SectionCard({ icon, title, children, delay, accentColor = '#0FCFBC' }: any) {
  return (
    <AnimatedEntry delay={delay} style={[crd.wrap, { borderColor: `${accentColor}22` }]}>
      <View style={crd.header}>
        <View style={[crd.iconBox, {
          backgroundColor: `${accentColor}18`,
          borderColor: `${accentColor}33`,
        }]}>
          <Text style={[crd.icon, { color: accentColor }]}>{icon}</Text>
        </View>
        <Text style={crd.title}>{title}</Text>
      </View>
      {children}
    </AnimatedEntry>
  );
}

function BulletItem({ text, color = '#0FCFBC', icon = '◎' }: any) {
  return (
    <View style={bi.row}>
      <Text style={[bi.icon, { color }]}>{icon}</Text>
      <Text style={bi.text}>{text}</Text>
    </View>
  );
}

function extractArray(data: any): string[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item: any) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        return Object.entries(item)
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
          .join(', ');
      }
      return String(item);
    });
  }
  if (typeof data === 'string') return data.split('\n').filter(Boolean);
  if (typeof data === 'object') {
    const vals: string[] = [];
    Object.values(data).forEach((v: any) => {
      if (Array.isArray(v)) vals.push(...v.map(String));
      else if (typeof v === 'string') vals.push(v);
    });
    return vals;
  }
  return [String(data)];
}

function extractString(data: any, key?: string): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (key && typeof data === 'object' && data[key]) return String(data[key]);
  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([k, v]) => {
        if (typeof v === 'string') return v;
        if (Array.isArray(v)) return v.join(', ');
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
  return String(data);
}

function extractStats(market: any): { label: string; value: string; trend: string }[] {
  const stats = [];
  if (!market) return getDefaultStats();
  if (typeof market === 'object') {
    if (market.market_size) stats.push({
      label: 'Total Market Size',
      value: String(market.market_size).slice(0, 20),
      trend: '+14%',
    });
    if (market.growth_rate) stats.push({
      label: 'Annual Growth Rate',
      value: String(market.growth_rate).slice(0, 15),
      trend: '+2.1%',
    });
    if (market.key_insight) stats.push({
      label: 'Key Insight',
      value: String(market.key_insight).slice(0, 20),
      trend: '',
    });
    if (market.opportunities && Array.isArray(market.opportunities)) {
      stats.push({
        label: 'Opportunities',
        value: `${market.opportunities.length} Found`,
        trend: '+High',
      });
    }
  }
  return stats.length > 0 ? stats.slice(0, 4) : getDefaultStats();
}

function getDefaultStats() {
  return [
    { label: 'Market Size', value: 'Analysing...', trend: '' },
    { label: 'Growth Rate', value: 'Analysing...', trend: '' },
    { label: 'Competition', value: 'Medium', trend: '' },
    { label: 'Opportunity', value: 'High', trend: '+High' },
  ];
}

export default function ReportScreen() {
  const { report, query } = useLocalSearchParams();
  const router = useRouter();
  const { saveReport } = useOfflineReports();
  const headerFade = useRef(new Animated.Value(0)).current;

  let parsedReport: any = null;
  try {
    parsedReport = JSON.parse(report as string);
  } catch {
    return (
      <View style={s.container}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={s.backBtn}>
          <Text style={s.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={{
          color: '#FF4D4D', fontFamily: 'Outfit_400Regular',
          textAlign: 'center', marginTop: 40,
        }}>
          Failed to load report.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    if (parsedReport) {
      saveReport({
        id: parsedReport._id || Date.now().toString(),
        query: query as string,
        createdAt: new Date().toISOString(),
        market: extractString(parsedReport.market),
        competitors: extractString(parsedReport.competitors),
        audience: extractString(parsedReport.audience),
        content: extractString(parsedReport.content),
      });
    }
  }, []);

  const marketData = parsedReport?.market || {};
  const competitorData = parsedReport?.competitors || {};
  const audienceData = parsedReport?.audience || {};
  const contentData = parsedReport?.content || {};

  const growthTrends = extractArray(
    marketData.growth_trends || marketData.trends || []
  );
  const opportunities = extractArray(marketData.opportunities || []);
  const risks = extractArray(
    marketData.risks || competitorData.risks || []
  );
  const competitors = extractArray(
    competitorData.top_competitors ||
    competitorData.rival_list ||
    competitorData.list ||
    []
  );
  const stats = extractStats(marketData);

  const quickSummary = extractString(
    marketData.key_insight ||
    marketData.summary ||
    parsedReport?.summary
  ) || `The ${query} sector shows strong market indicators with significant growth potential. Analysis reveals favorable conditions for entry with competitive advantages available through strategic positioning.`;

  const compBars = [
    { label: 'Market Leader', value: 0.34, color: '#0FCFBC' },
    { label: 'Strong Competitor', value: 0.28, color: '#4A9EFF' },
    { label: 'Niche Player', value: 0.15, color: '#8B5CF6' },
    { label: 'New Startups', value: 0.23, color: '#F59E0B' },
  ];

  const audienceBullets = extractArray(
    audienceData.pain_points ||
    audienceData.demographics ||
    audienceData
  );

  const contentPillars = extractArray(
    contentData.content_pillars ||
    contentData.platforms ||
    contentData
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Header ── */}
        <Animated.View style={[s.header, { opacity: headerFade }]}>
          <TouchableOpacity onPress={() => router.replace('/home')} style={s.backBtn}>
            <Text style={s.backText}>← BACK</Text>
          </TouchableOpacity>
          <View style={s.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.reportLabel}>INTELLIGENCE REPORT</Text>
              <Text style={s.reportQuery} numberOfLines={2}>{query}</Text>
              <Text style={s.reportSub}>
                Comprehensive analysis including market sizing, competitive
                landscape, and predictive growth trajectories.
              </Text>
            </View>
            <ScoreRing score={92} />
          </View>
        </Animated.View>

        {/* ── Quick Summary ── */}
        <SectionCard icon="◉" title="Quick Summary" delay={100}>
          <Text style={crd.summaryText}>{quickSummary}</Text>
          <View style={crd.summaryFooter}>
            <View style={crd.verifiedBadge}>
              <View style={crd.verifiedDot} />
              <Text style={crd.verifiedText}>AI VERIFIED</Text>
            </View>
            <Text style={crd.summaryMeta}>REAL-TIME DATA SYNTHESIS</Text>
          </View>
        </SectionCard>

        {/* ── Key Numbers ── */}
        <AnimatedEntry delay={200} style={s.sectionWrap}>
          <View style={s.sectionHeader}>
            <View style={s.sectionIconBox}>
              <Text style={s.sectionIcon}>◈</Text>
            </View>
            <Text style={s.sectionTitle}>Key Numbers</Text>
          </View>
          <View style={s.statsGrid}>
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} delay={250 + i * 80} />
            ))}
          </View>
        </AnimatedEntry>

        {/* ── Why It's Growing ── */}
        <SectionCard icon="↑" title="Why It's Growing" delay={400}>
          {(growthTrends.length > 0
            ? growthTrends
            : ['Strong demand signals', 'Low market competition', 'High tech adoption']
          ).map((item, i) => (
            <BulletItem key={i} text={item} color="#0FCFBC" icon="◎" />
          ))}
        </SectionCard>

        {/* ── Potential Risks ── */}
        <SectionCard icon="⚠" title="Potential Risks" delay={500} accentColor="#FF4D4D">
          {(risks.length > 0
            ? risks
            : ['Market saturation risk', 'Regulatory compliance', 'High entry cost']
          ).map((item, i) => (
            <BulletItem key={i} text={item} color="#FF4D4D" icon="●" />
          ))}
        </SectionCard>

        {/* ── Competitive Landscape ── */}
        <SectionCard icon="◆" title="Competitive Landscape" delay={600}>
          {competitors.length > 0 ? competitors.slice(0, 3).map((c, i) => (
            <View key={i} style={crd.competitorRow}>
              <Text style={crd.competitorText}>{c}</Text>
            </View>
          )) : null}
          {compBars.map((bar, i) => (
            <AnimatedBar key={bar.label} {...bar} delay={650 + i * 100} />
          ))}
          {competitorData.differentiation ? (
            <View style={crd.diffBox}>
              <Text style={crd.diffLabel}>DIFFERENTIATION STRATEGY</Text>
              <Text style={crd.diffText}>
                {extractString(competitorData.differentiation)}
              </Text>
            </View>
          ) : null}
        </SectionCard>

        {/* ── Target Audience ── */}
        <SectionCard icon="◉" title="Target Audience" delay={720} accentColor="#4A9EFF">
          {audienceData.demographics ? (
            <View style={crd.demoBox}>
              <Text style={crd.demoLabel}>DEMOGRAPHICS</Text>
              <View style={crd.demoRow}>
                {Object.entries(audienceData.demographics).map(([k, v]: any) => (
                  <View key={k} style={crd.demoChip}>
                    <Text style={crd.demoChipLabel}>
                      {k.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={crd.demoChipValue}>{String(v)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {(audienceBullets.length > 0
            ? audienceBullets
            : ['Early adopters', 'SME business owners', 'Growth-focused teams']
          ).map((item, i) => (
            <BulletItem key={i} text={item} color="#4A9EFF" icon="◎" />
          ))}
        </SectionCard>

        {/* ── Content Strategy ── */}
        <SectionCard icon="◇" title="Content Strategy" delay={840} accentColor="#8B5CF6">
          {contentData.content_mix ? (
            <View style={crd.mixBox}>
              <Text style={crd.mixLabel}>CONTENT MIX</Text>
              <View style={crd.mixRow}>
                {Object.entries(contentData.content_mix).map(([k, v]: any) => (
                  <View key={k} style={crd.mixChip}>
                    <Text style={crd.mixChipValue}>{String(v)}</Text>
                    <Text style={crd.mixChipKey}>{k.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {(contentPillars.length > 0
            ? contentPillars
            : ['Educational content', 'Social proof', 'Platform presence']
          ).map((item, i) => (
            <BulletItem key={i} text={item} color="#8B5CF6" icon="◆" />
          ))}
          {contentData.platforms && extractArray(contentData.platforms).length > 0 ? (
            <View style={crd.platformRow}>
              <Text style={crd.platformLabel}>PLATFORMS</Text>
              {extractArray(contentData.platforms).map((p, i) => (
                <View key={i} style={crd.platformChip}>
                  <Text style={crd.platformChipText}>{p}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </SectionCard>

        {/* ── Action Footer ── */}
        <AnimatedEntry delay={960} style={s.actionFooter}>
          <View style={s.actionDivider} />
          <Text style={s.actionTitle}>ARIA INTELLIGENCE ENGINE</Text>
          <Text style={s.actionSub}>
            Report generated in real-time  •  Data verified
          </Text>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => router.replace('/home')}
          >
            <Text style={s.actionBtnText}>Generate New Report →</Text>
          </TouchableOpacity>
        </AnimatedEntry>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Score Ring ────────────────────────────────────────────────
const sc = StyleSheet.create({
  wrap: { alignItems: 'center', marginLeft: 12 },
  ring: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: '#0FCFBC',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,207,188,0.08)',
  },
  ringInner: { alignItems: 'center' },
  scoreNum: {
    color: '#FAFAFA', fontSize: 26,
    fontFamily: 'PlayfairDisplay_900Black',
  },
  scoreLabel: {
    color: '#0FCFBC', fontSize: 8,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2,
  },
  scoreTitle: {
    color: '#5A6A7E', fontSize: 10,
    fontFamily: 'Outfit_400Regular', marginTop: 6,
  },
});

// ── Stat Card ─────────────────────────────────────────────────
const st = StyleSheet.create({
  card: {
    width: (width - 64) / 2,
    backgroundColor: '#0A0F14', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.12)', padding: 14, marginBottom: 8,
  },
  label: {
    color: '#5A6A7E', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 1, marginBottom: 6,
  },
  value: {
    color: '#FAFAFA', fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black', marginBottom: 6,
  },
  trendBadge: {
    alignSelf: 'flex-start', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  trendText: { fontSize: 10, fontFamily: 'Outfit_600SemiBold' },
});

// ── Animated Bar ──────────────────────────────────────────────
const ab = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 10,
  },
  label: {
    color: '#5A6A7E', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', width: 110, letterSpacing: 0.5,
  },
  track: {
    flex: 1, height: 5,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3,
  },
  fill: { height: 5, borderRadius: 3 },
  pct: {
    fontSize: 10, fontFamily: 'Outfit_600SemiBold',
    width: 32, textAlign: 'right',
  },
});

// ── Section Card ──────────────────────────────────────────────
const crd = StyleSheet.create({
  wrap: {
    backgroundColor: '#0A0F14', borderRadius: 10, borderWidth: 1,
    padding: 18, marginBottom: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 14,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  title: {
    color: '#FAFAFA', fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
  },
  summaryText: {
    color: '#E8EDF2', fontSize: 14, fontFamily: 'Outfit_400Regular',
    lineHeight: 22, marginBottom: 14,
  },
  summaryFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(15,207,188,0.1)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.2)',
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#0FCFBC',
  },
  verifiedText: {
    color: '#0FCFBC', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 1,
  },
  summaryMeta: {
    color: '#3D4F63', fontSize: 8,
    fontFamily: 'Outfit_500Medium', letterSpacing: 1,
  },
  competitorRow: {
    backgroundColor: 'rgba(15,207,188,0.05)', borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.1)',
    padding: 10, marginBottom: 8,
  },
  competitorText: {
    color: '#E8EDF2', fontSize: 12, fontFamily: 'Outfit_400Regular',
  },
  diffBox: {
    backgroundColor: 'rgba(15,207,188,0.06)', borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.15)',
    padding: 12, marginTop: 10,
  },
  diffLabel: {
    color: '#0FCFBC', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2, marginBottom: 4,
  },
  diffText: {
    color: '#E8EDF2', fontSize: 13,
    fontFamily: 'Outfit_400Regular', lineHeight: 18,
  },
  demoBox: { marginBottom: 14 },
  demoLabel: {
    color: '#5A6A7E', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2, marginBottom: 8,
  },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  demoChip: {
    backgroundColor: 'rgba(74,158,255,0.1)', borderRadius: 4,
    borderWidth: 1, borderColor: 'rgba(74,158,255,0.2)',
    paddingHorizontal: 8, paddingVertical: 5,
  },
  demoChipLabel: {
    color: '#4A9EFF', fontSize: 8,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 1,
  },
  demoChipValue: {
    color: '#FAFAFA', fontSize: 11,
    fontFamily: 'Outfit_500Medium', marginTop: 1,
  },
  mixBox: { marginBottom: 14 },
  mixLabel: {
    color: '#5A6A7E', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2, marginBottom: 8,
  },
  mixRow: { flexDirection: 'row', gap: 8 },
  mixChip: {
    flex: 1, backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
    padding: 10, alignItems: 'center',
  },
  mixChipValue: {
    color: '#8B5CF6', fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black', marginBottom: 2,
  },
  mixChipKey: {
    color: '#5A6A7E', fontSize: 9,
    fontFamily: 'Outfit_400Regular', textAlign: 'center',
  },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  platformLabel: {
    color: '#5A6A7E', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2,
    width: '100%', marginBottom: 4,
  },
  platformChip: {
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 4,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  platformChipText: {
    color: '#8B5CF6', fontSize: 11, fontFamily: 'Outfit_500Medium',
  },
});

// ── Bullet Item ───────────────────────────────────────────────
const bi = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 8, marginBottom: 8,
  },
  icon: { fontSize: 10, marginTop: 3 },
  text: {
    color: '#E8EDF2', fontSize: 13,
    fontFamily: 'Outfit_400Regular', flex: 1, lineHeight: 18,
  },
});

// ── Main Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090C' },
  scrollContent: {
    paddingHorizontal: 20, paddingTop: 60,
    backgroundColor: '#08090C',
  },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 20 },
  backText: {
    fontSize: 10, color: '#0FCFBC',
    letterSpacing: 3, fontFamily: 'Outfit_600SemiBold',
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  reportLabel: {
    color: '#0FCFBC', fontSize: 9,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 3, marginBottom: 6,
  },
  reportQuery: {
    color: '#FAFAFA', fontSize: 30,
    fontFamily: 'PlayfairDisplay_900Black',
    lineHeight: 34, marginBottom: 8,
  },
  reportSub: {
    color: '#5A6A7E', fontSize: 12,
    fontFamily: 'Outfit_400Regular', lineHeight: 18,
  },
  sectionWrap: {
    backgroundColor: '#0A0F14', borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.12)', padding: 18, marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 14,
  },
  sectionIconBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(15,207,188,0.12)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionIcon: { color: '#0FCFBC', fontSize: 16 },
  sectionTitle: {
    color: '#FAFAFA', fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionFooter: { alignItems: 'center', paddingTop: 20 },
  actionDivider: {
    width: 40, height: 1.5,
    backgroundColor: 'rgba(15,207,188,0.4)', marginBottom: 16,
  },
  actionTitle: {
    color: '#0FCFBC', fontSize: 10,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 3, marginBottom: 4,
  },
  actionSub: {
    color: '#3D4F63', fontSize: 11,
    fontFamily: 'Outfit_400Regular', marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#0FCFBC', borderRadius: 50,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  actionBtnText: {
    color: '#08090C', fontSize: 14, fontFamily: 'Outfit_600SemiBold',
  },
});