import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { theme } from '../config/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Account created! Please login.');
        router.replace('/login');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ARIA</Text>
      <Text style={styles.tagline}>CREATE ACCOUNT</Text>
      <View style={styles.divider} />

      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor={theme.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={theme.bgPrimary} />
          : <Text style={styles.buttonText}>REGISTER</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.ghostButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.ghostButtonText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space3,
  },
  logo: {
    fontSize: 64,
    color: theme.textPrimary,
    fontWeight: '800',
    letterSpacing: -2,
    fontFamily: 'PlayfairDisplay_900Black',
    marginBottom: theme.space1,
  },
  tagline: {
    fontSize: 11,
    color: theme.teal,
    letterSpacing: 6,
    fontFamily: 'Outfit_600SemiBold',
    marginBottom: theme.space2,
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: theme.teal40,
    marginBottom: theme.space6,
  },
  input: {
    width: '100%',
    backgroundColor: theme.bgSecondary,
    color: theme.textPrimary,
    padding: theme.space2,
    borderRadius: theme.radiusLg,
    marginBottom: theme.space2,
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    borderWidth: 1,
    borderColor: theme.teal25,
  },
  button: {
    width: '100%',
    backgroundColor: theme.teal,
    padding: theme.space2,
    borderRadius: theme.radiusLg,
    alignItems: 'center',
    marginBottom: theme.space2,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: theme.bgPrimary,
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 4,
  },
  ghostButton: {
    width: '100%',
    padding: theme.space2,
    borderRadius: theme.radiusLg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.teal25,
  },
  ghostButtonText: {
    color: theme.teal,
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  },
});