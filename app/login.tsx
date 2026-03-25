import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const FLOAT_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 3 + 1.5,
  speed: Math.random() * 4000 + 3000,
  color: i % 4 === 0
    ? 'rgba(255,107,107,0.5)'
    : i % 3 === 0
    ? 'rgba(15,207,188,0.6)'
    : 'rgba(15,207,188,0.3)',
}));

function FloatingParticles() {
  const anims = useRef(FLOAT_PARTICLES.map(() => new Animated.Value(0))).current;
  const xAnims = useRef(FLOAT_PARTICLES.map(() => new Animated.Value(0))).current;
  const opAnims = useRef(FLOAT_PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    FLOAT_PARTICLES.forEach((p, i) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anims[i], { toValue: 1, duration: p.speed, useNativeDriver: true }),
            Animated.timing(anims[i], { toValue: 0, duration: p.speed, useNativeDriver: true }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(xAnims[i], { toValue: 1, duration: p.speed * 1.4, useNativeDriver: true }),
            Animated.timing(xAnims[i], { toValue: 0, duration: p.speed * 1.4, useNativeDriver: true }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(opAnims[i], { toValue: 1, duration: p.speed * 0.6, useNativeDriver: true }),
            Animated.timing(opAnims[i], { toValue: 0.2, duration: p.speed * 0.6, useNativeDriver: true }),
          ])
        ).start();
      }, i * 150);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Grid lines horizontal */}
      {Array.from({ length: 8 }, (_, i) => (
        <View key={`h${i}`} style={{
          position: 'absolute', left: 0, right: 0,
          top: (height / 8) * i, height: 1,
          backgroundColor: 'rgba(15,207,188,0.035)',
        }} />
      ))}
      {/* Grid lines vertical */}
      {Array.from({ length: 5 }, (_, i) => (
        <View key={`v${i}`} style={{
          position: 'absolute', top: 0, bottom: 0,
          left: (width / 5) * i, width: 1,
          backgroundColor: 'rgba(15,207,188,0.035)',
        }} />
      ))}
      {/* Floating dots */}
      {FLOAT_PARTICLES.map((p, i) => {
        const translateY = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
        const translateX = xAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.id % 2 === 0 ? 18 : -18] });
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const hasLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill all fields.'); return; }
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
      console.log('AUTH RESPONSE:', JSON.stringify(data, null, 2));
      const token = data.token;
      if (token) {
        await SecureStore.setItemAsync('token', token);
        router.replace('/home' as any);
      } else {
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch (e) {
      console.error('AUTH ERROR:', e);
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const Check = ({ pass, label }: { pass: boolean; label: string }) => (
    <View style={s.checkRow}>
      <View style={[s.checkBox, pass && s.checkBoxActive]}>
        {pass && <Text style={s.checkMark}>✓</Text>}
      </View>
      <Text style={[s.checkLabel, pass && s.checkLabelActive]}>{label}</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <FloatingParticles />
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
          {/* Logo */}
          <Animated.View style={[s.logoSection, {
            opacity: fadeAnim,
            transform: [{ scale: logoScale }],
          }]}>
            <View style={s.logoRow}>
              <View style={s.logoIcon}>
                <Text style={s.logoSymbol}>◈</Text>
              </View>
              <Text style={s.logoText}>ARIA</Text>
            </View>
          </Animated.View>

          {/* Brand */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 28 }}>
            <Text style={s.brandH1}>Start</Text>
            <Text style={s.brandH2}>Researching.</Text>
            <Text style={s.brandSub}>
              Create your free account and generate your first{'\n'}AI intelligence report in under 30 seconds.
            </Text>
            <View style={s.features}>
              {['Full intelligence reports', 'PDF export & history', 'Completely free to start'].map((f, i) => (
                <Animated.View key={f} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 40], outputRange: [0, 20 + i * 10] }) }],
                }}>
                  <View style={s.featureCheck}>
                    <Text style={s.featureCheckMark}>✓</Text>
                  </View>
                  <Text style={s.featureText}>{f}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[s.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={s.formTitle}>{isLogin ? 'Sign In' : 'Register'}</Text>
            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
              <Text style={s.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={s.switchLink}>{isLogin ? 'Register' : 'Sign in'}</Text>
              </Text>
            </TouchableOpacity>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <Text style={s.inputLabel}>EMAIL</Text>
            <TextInput
              style={[s.input, email.length > 0 && s.inputFilled]}
              placeholder="your@email.com"
              placeholderTextColor="#5A6A7E"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={s.inputLabel}>PASSWORD</Text>
            <View style={s.inputRow}>
              <TextInput
                style={[s.input, s.inputFlex, password.length > 0 && s.inputFilled]}
                placeholder="••••••••"
                placeholderTextColor="#5A6A7E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                style={[s.eyeBtn, password.length > 0 && s.eyeBtnFilled]}
                onPress={() => setShowPass(!showPass)}
              >
                <Text style={s.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <Text style={s.inputLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={[s.input, confirm.length > 0 && s.inputFilled]}
                  placeholder="Repeat password"
                  placeholderTextColor="#5A6A7E"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                />
                <View style={s.checks}>
                  <Check pass={hasLength} label="At least 6 characters" />
                  <Check pass={hasNumber} label="Contains a number" />
                  <Check pass={passwordsMatch} label="Passwords match" />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[s.ctaBtn, loading && s.ctaBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={s.ctaBtnText}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
              </Text>
            </TouchableOpacity>

            {!isLogin && (
              <Text style={s.terms}>By signing up, you agree to ARIA's Terms of Service.</Text>
            )}
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08090C' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoSection: { marginBottom: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(15,207,188,0.12)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoSymbol: { color: '#0FCFBC', fontSize: 20 },
  logoText: {
    color: '#FAFAFA', fontSize: 24,
    fontFamily: 'PlayfairDisplay_900Black', letterSpacing: 3,
  },
  brandH1: {
    color: '#FAFAFA', fontSize: 46,
    fontFamily: 'PlayfairDisplay_900Black', lineHeight: 52,
  },
  brandH2: {
    color: '#0FCFBC', fontSize: 46,
    fontFamily: 'PlayfairDisplay_900Black', lineHeight: 54,
    marginBottom: 14,
  },
  brandSub: {
    color: '#E8EDF2', fontSize: 14,
    fontFamily: 'Outfit_400Regular', lineHeight: 22, marginBottom: 20,
  },
  features: { gap: 12 },
  featureCheck: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: 'rgba(15,207,188,0.12)',
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureCheckMark: { color: '#0FCFBC', fontSize: 11, fontWeight: '700' },
  featureText: { color: '#E8EDF2', fontSize: 14, fontFamily: 'Outfit_400Regular' },
  formCard: {
    backgroundColor: '#0E1117', borderRadius: 14, padding: 24,
    borderWidth: 1, borderColor: 'rgba(15,207,188,0.18)',
  },
  formTitle: {
    color: '#FAFAFA', fontSize: 36,
    fontFamily: 'PlayfairDisplay_900Black', marginBottom: 4,
  },
  switchText: {
    color: '#5A6A7E', fontSize: 13,
    fontFamily: 'Outfit_400Regular', marginBottom: 20,
  },
  switchLink: { color: '#0FCFBC', fontFamily: 'Outfit_600SemiBold' },
  errorBox: {
    backgroundColor: 'rgba(180,30,30,0.2)', borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(255,77,77,0.35)',
    padding: 12, marginBottom: 16,
  },
  errorText: { color: '#FF6B6B', fontSize: 13, fontFamily: 'Outfit_400Regular' },
  inputLabel: {
    color: '#5A6A7E', fontSize: 10,
    fontFamily: 'Outfit_600SemiBold', letterSpacing: 2,
    marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: '#141922', borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.15)', padding: 14,
    color: '#FAFAFA', fontSize: 15, fontFamily: 'Outfit_400Regular',
  },
  inputFilled: { backgroundColor: '#E8F4F2', color: '#0A0A0A', borderColor: '#0FCFBC' },
  inputFlex: { flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: {
    backgroundColor: '#141922', borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.15)', borderRadius: 8,
    padding: 14, alignItems: 'center', justifyContent: 'center',
  },
  eyeBtnFilled: { backgroundColor: '#E8F4F2', borderColor: '#0FCFBC' },
  eyeIcon: { fontSize: 16 },
  checks: { gap: 8, marginTop: 10, marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkBox: {
    width: 18, height: 18, borderRadius: 3,
    backgroundColor: '#141922', borderWidth: 1,
    borderColor: 'rgba(15,207,188,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: 'rgba(15,207,188,0.15)' },
  checkMark: { color: '#0FCFBC', fontSize: 10, fontWeight: '700' },
  checkLabel: { color: '#5A6A7E', fontSize: 12, fontFamily: 'Outfit_400Regular' },
  checkLabelActive: { color: '#0FCFBC' },
  ctaBtn: {
    backgroundColor: '#0FCFBC', borderRadius: 50,
    padding: 17, alignItems: 'center', marginTop: 24,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: '#08090C', fontSize: 16, fontFamily: 'Outfit_600SemiBold' },
  terms: {
    color: '#5A6A7E', fontSize: 11,
    fontFamily: 'Outfit_300Light', textAlign: 'center', marginTop: 14,
  },
});