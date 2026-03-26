import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 3 + 1.5,
  speed: Math.random() * 4000 + 3000,
  color: i % 5 === 0
    ? 'rgba(255,77,77,0.45)'
    : i % 3 === 0
    ? 'rgba(15,207,188,0.55)'
    : 'rgba(15,207,188,0.2)',
}));

function FloatingBg() {
  const anims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;
  const xAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;
  const opAnims = useRef(PARTICLES.map(() => new Animated.Value(0.2))).current;

  useEffect(() => {
    PARTICLES.forEach((p, i) => {
      setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(anims[i], { toValue: 1, duration: p.speed, useNativeDriver: true }),
          Animated.timing(anims[i], { toValue: 0, duration: p.speed, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
          Animated.timing(xAnims[i], { toValue: 1, duration: p.speed * 1.3, useNativeDriver: true }),
          Animated.timing(xAnims[i], { toValue: 0, duration: p.speed * 1.3, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
          Animated.timing(opAnims[i], { toValue: 1, duration: p.speed * 0.5, useNativeDriver: true }),
          Animated.timing(opAnims[i], { toValue: 0.1, duration: p.speed * 0.5, useNativeDriver: true }),
        ])).start();
      }, i * 120);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: 9 }, (_, i) => (
        <View key={`h${i}`} style={{
          position: 'absolute', left: 0, right: 0,
          top: (height / 9) * i, height: 1,
          backgroundColor: 'rgba(15,207,188,0.03)',
        }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <View key={`v${i}`} style={{
          position: 'absolute', top: 0, bottom: 0,
          left: (width / 6) * i, width: 1,
          backgroundColor: 'rgba(15,207,188,0.03)',
        }} />
      ))}
      {PARTICLES.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1], outputRange: [0, -50],
        });
        const translateX = xAnims[i].interpolate({
          inputRange: [0, 1], outputRange: [0, p.id % 2 === 0 ? 20 : -20],
        });
        return (
          <Animated.View key={p.id} style={{
            position: 'absolute',
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: opAnims[i],
            transform: [{ translateY }, { translateX }],
          }} />
        );
      })}
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(formSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const hasLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!isLogin && !passwordsMatch) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      const token = data.token;
      if (token) {
        await SecureStore.setItemAsync('token', token);
        router.replace('/home' as any);
      } else {
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <View style={s.eyeInner}>
      {showPass ? (
        // Eye with slash — hide
        <View>
          <View style={s.eyeOval} />
          <View style={s.eyeSlash} />
        </View>
      ) : (
        // Open eye — show
        <View>
          <View style={s.eyeOval} />
          <View style={s.eyePupil} />
        </View>
      )}
    </View>
  );

  const Check = ({ pass, label }: { pass: boolean; label: string }) => (
    <View style={s.checkRow}>
      <View style={[s.checkBox, pass && s.checkBoxOn]}>
        {pass && <Text style={s.checkMark}>✓</Text>}
      </View>
      <Text style={[s.checkLabel, pass && s.checkLabelOn]}>{label}</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />
      <FloatingBg />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* ── Logo ── */}
          <Animated.View style={[s.logoWrap, {
            opacity: fadeAnim,
            transform: [{ scale: logoScale }],
          }]}>
            <View style={s.logoRow}>
              <View style={s.logoBox}>
                <Text style={s.logoSymbol}>◈</Text>
              </View>
              <View>
                <Text style={s.logoText}>ARIA</Text>
                <Text style={s.logoSub}>INTELLIGENCE ENGINE</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Hero ── */}
          <Animated.View style={[s.hero, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }]}>
            <Text style={s.heroH1}>Start</Text>
            <Text style={s.heroH2}>Researching.</Text>
            <Text style={s.heroSub}>
              Create your free account and generate your first{'\n'}
              AI intelligence report in under 30 seconds.
            </Text>

            {/* Feature list */}
            <View style={s.featureList}>
              {[
                'Full intelligence reports',
                'Market, audience & competitor data',
                'Completely free to start',
              ].map((f, i) => (
                <Animated.View key={f} style={[s.featureRow, {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim.interpolate({
                    inputRange: [0, 50], outputRange: [0, 15 + i * 8],
                  })}],
                }]}>
                  <View style={s.featureCheck}>
                    <Text style={s.featureCheckText}>✓</Text>
                  </View>
                  <Text style={s.featureText}>{f}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ── Form Card ── */}
          <Animated.View style={[s.card, {
            opacity: formFade,
            transform: [{ translateY: formSlide }],
          }]}>
            {/* Card Header */}
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>{isLogin ? 'Sign In' : 'Register'}</Text>
              <View style={s.tabRow}>
                <TouchableOpacity
                  style={[s.tab, isLogin && s.tabActive]}
                  onPress={() => { setIsLogin(true); setError(''); }}
                >
                  <Text style={[s.tabText, isLogin && s.tabTextActive]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.tab, !isLogin && s.tabActive]}
                  onPress={() => { setIsLogin(false); setError(''); }}
                >
                  <Text style={[s.tabText, !isLogin && s.tabTextActive]}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.cardDivider} />

            {/* Error */}
            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠  {error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={[s.input, focusedField === 'email' && s.inputFocused]}
              placeholder="your@email.com"
              placeholderTextColor="#3D4F63"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <Text style={s.label}>PASSWORD</Text>
            <View style={s.inputRow}>
              <TextInput
                style={[s.input, s.inputFlex, focusedField === 'pass' && s.inputFocused]}
                placeholder="••••••••"
                placeholderTextColor="#3D4F63"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('pass')}
                onBlur={() => setFocusedField('')}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                style={[s.eyeBtn, focusedField === 'pass' && s.eyeBtnFocused]}
                onPress={() => setShowPass(!showPass)}
                activeOpacity={0.7}
              >
                <EyeIcon />
              </TouchableOpacity>
            </View>

            {/* Confirm + Checks */}
            {!isLogin && (
              <>
                <Text style={s.label}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={[s.input, focusedField === 'confirm' && s.inputFocused]}
                  placeholder="Repeat password"
                  placeholderTextColor="#3D4F63"
                  value={confirm}
                  onChangeText={setConfirm}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField('')}
                  secureTextEntry={!showPass}
                />
                <View style={s.checks}>
                  <Check pass={hasLength} label="At least 6 characters" />
                  <Check pass={hasNumber} label="Contains a number" />
                  <Check pass={passwordsMatch} label="Passwords match" />
                </View>
              </>
            )}

            {/* CTA */}
            <TouchableOpacity
              style={[s.ctaBtn, loading && s.ctaBtnOff]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={s.ctaBtnText}>
                {loading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In →'
                  : 'Create Account →'}
              </Text>
            </TouchableOpacity>

            {/* Bottom note */}
            <View style={s.cardFooter}>
              <View style={s.footerDot} />
              <Text style={s.footerText}>
                {isLogin
                  ? 'Secure login  •  JWT protected'
                  : 'Free forever  •  No credit card required'}
              </Text>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  scroll: {
    flexGrow: 1, paddingHorizontal: 24,
    paddingTop: 56, paddingBottom: 40,
    backgroundColor: '#08090C',
  },

  // Logo
  logoWrap: { marginBottom: 36 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(15,207,188,0.12)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoSymbol: { color: '#0FCFBC', fontSize: 20 },
  logoText: {
    color: '#FAFAFA', fontSize: 22,
    fontFamily: 'PlayfairDisplay_900Black', letterSpacing: 3,
  },
  logoSub: {
    color: 'rgba(15,207,188,0.5)', fontSize: 8,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 3,
  },

  // Hero
  hero: { marginBottom: 32 },
  heroH1: {
    color: '#FAFAFA', fontSize: 48,
    fontFamily: 'PlayfairDisplay_900Black', lineHeight: 54,
  },
  heroH2: {
    color: '#0FCFBC', fontSize: 48,
    fontFamily: 'PlayfairDisplay_900Black', lineHeight: 56,
    marginBottom: 16,
  },
  heroSub: {
    color: '#8898AA', fontSize: 14,
    fontFamily: 'Outfit_400Regular', lineHeight: 22, marginBottom: 24,
  },
  featureList: { gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: 'rgba(15,207,188,0.1)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureCheckText: { color: '#0FCFBC', fontSize: 11, fontWeight: '700' },
  featureText: {
    color: '#E8EDF2', fontSize: 14, fontFamily: 'Outfit_400Regular',
  },

  // Card
  card: {
    backgroundColor: '#0E1117', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.15)',
    overflow: 'hidden',
  },
  cardHeader: { padding: 24, paddingBottom: 0 },
  cardTitle: {
    color: '#FAFAFA', fontSize: 32,
    fontFamily: 'PlayfairDisplay_900Black', marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row', gap: 0,
    backgroundColor: '#0A0F14', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.12)',
    padding: 3, marginBottom: 20,
  },
  tab: {
    flex: 1, paddingVertical: 10,
    alignItems: 'center', borderRadius: 6,
  },
  tabActive: { backgroundColor: 'rgba(15,207,188,0.12)' },
  tabText: {
    color: '#5A6A7E', fontSize: 12,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 1,
  },
  tabTextActive: { color: '#0FCFBC' },
  cardDivider: {
    height: 1, backgroundColor: 'rgba(15,207,188,0.08)',
    marginHorizontal: 0,
  },

  // Form fields
  errorBox: {
    backgroundColor: 'rgba(180,30,30,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,77,77,0.3)',
    borderRadius: 8, padding: 12,
    marginHorizontal: 24, marginTop: 16,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, fontFamily: 'Outfit_400Regular' },
  label: {
    color: '#5A6A7E', fontSize: 10,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2,
    marginBottom: 6, marginTop: 18,
    marginHorizontal: 24,
  },
  input: {
    backgroundColor: '#0A0F14', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.12)',
    padding: 15, color: '#FAFAFA',
    fontSize: 15, fontFamily: 'Outfit_400Regular',
    marginHorizontal: 24,
  },
  inputFocused: {
    borderColor: 'rgba(15,207,188,0.5)',
    backgroundColor: '#0D1520',
  },
  inputFlex: { flex: 1, marginHorizontal: 0 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginHorizontal: 24,
  },

  // Eye button
  eyeBtn: {
    backgroundColor: '#0A0F14', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.12)',
    width: 52, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  eyeBtnFocused: { borderColor: 'rgba(15,207,188,0.5)' },
  eyeInner: { alignItems: 'center', justifyContent: 'center', width: 22, height: 22 },
  eyeOval: {
    width: 18, height: 12, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#0FCFBC',
    position: 'absolute',
  },
  eyePupil: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#0FCFBC',
  },
  eyeSlash: {
    position: 'absolute',
    width: 22, height: 1.5,
    backgroundColor: '#0FCFBC',
    transform: [{ rotate: '-40deg' }],
  },

  // Password checks
  checks: { gap: 8, marginTop: 12, marginHorizontal: 24 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkBox: {
    width: 18, height: 18, borderRadius: 4,
    backgroundColor: '#0A0F14', borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: 'rgba(15,207,188,0.15)',
    borderColor: '#0FCFBC',
  },
  checkMark: { color: '#0FCFBC', fontSize: 10, fontWeight: '700' },
  checkLabel: {
    color: '#5A6A7E', fontSize: 12,
    fontFamily: 'Outfit_400Regular',
  },
  checkLabelOn: { color: '#0FCFBC' },

  // CTA
  ctaBtn: {
    backgroundColor: '#0FCFBC', borderRadius: 50,
    padding: 17, alignItems: 'center',
    marginHorizontal: 24, marginTop: 24,
  },
  ctaBtnOff: { opacity: 0.55 },
  ctaBtnText: {
    color: '#08090C', fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },

  // Footer
  cardFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    padding: 20,
  },
  footerDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(15,207,188,0.4)',
  },
  footerText: {
    color: '#3D4F63', fontSize: 11,
    fontFamily: 'Outfit_400Regular',
  },
});