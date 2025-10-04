import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001');
      const data = await response.text();
      setMessage(data);
    } catch {
      setMessage('Backend not running. Start it with: cd backend && npm run start:dev');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Hackathon Boilerplate 🚀</Text>
            <Text style={styles.subtitle}>
              A blazingly fast starter template for your next project
            </Text>
          </View>

          {/* Cards Grid */}
          <View style={styles.cardsGrid}>
            {/* Frontend Stack Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Frontend Stack</Text>
                <Text style={styles.cardDescription}>Modern React Native with Expo</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.listItem}>✅ Expo ~52.0.0</Text>
                <Text style={styles.listItem}>✅ React Native 0.76.5</Text>
                <Text style={styles.listItem}>✅ React 18</Text>
                <Text style={styles.listItem}>✅ TypeScript</Text>
                <Text style={styles.listItem}>✅ Native Components</Text>
              </View>
            </View>

            {/* Backend Stack Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Backend Stack</Text>
                <Text style={styles.cardDescription}>Powerful NestJS API</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.listItem}>✅ NestJS Framework</Text>
                <Text style={styles.listItem}>✅ TypeScript</Text>
                <Text style={styles.listItem}>✅ SQLite Database</Text>
                <Text style={styles.listItem}>✅ TypeORM</Text>
                <Text style={styles.listItem}>✅ RESTful API</Text>
              </View>
            </View>
          </View>

          {/* Backend Connection Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Backend Connection</Text>
              <Text style={styles.cardDescription}>
                Test the connection between frontend and backend
              </Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>
                  {loading ? 'Loading...' : message || 'No response yet'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={fetchMessage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Test Connection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🐳 Docker-ready • 🔥 Hot reload • 📦 5-person team setup
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
  },
  cardsGrid: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardContent: {
    gap: 8,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
  },
  messageBox: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
