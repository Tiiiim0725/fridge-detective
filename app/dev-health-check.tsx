import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getHealthCheckMessage } from '@/services/healthCheckService';

export default function HealthCheckScreen() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function runHealthCheck() {
      try {
        const result = await getHealthCheckMessage();
        setMessage(result);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Unknown Supabase error'
        );
      } finally {
        setLoading(false);
      }
    }

    runHealthCheck();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>冰箱侦探 Supabase 测试</Text>

      {loading && (
        <View style={styles.content}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>正在连接 Supabase...</Text>
        </View>
      )}

      {!loading && message && (
        <Text style={styles.success}>Supabase connected: {message}</Text>
      )}

      {!loading && errorMessage && (
        <Text style={styles.error}>Supabase error: {errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  success: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '500',
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
});
