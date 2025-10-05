import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Button } from 'react-native-paper';
import { getMessages, sendMessage, type ChatMessage } from '@/lib/services/chat';
import { useAuth } from '@/lib/auth/context';
import { c } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '@/lib/http';
import { router } from 'expo-router';

export default function ChatScreen() {
  const { applicationId } = useLocalSearchParams();
  const { user } = useAuth();
  const [partnerName, setPartnerName] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const lastTimestampRef = useRef<string | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listRef = useRef<FlatList<ChatMessage> | null>(null);
  const navigation = useNavigation();

  const canChat = typeof applicationId === 'string' && applicationId.length > 0;

  const loadInitial = useCallback(async () => {
    if (!canChat) return;
    const initial = await getMessages(String(applicationId));
    setMessages(initial);
    if (initial.length > 0) lastTimestampRef.current = initial[initial.length - 1].createdAt;
  }, [applicationId, canChat]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Load partner name for header
  useEffect(() => {
    const loadPartner = async () => {
      try {
        if (!canChat) return;
        const app: any = await apiFetch<any>(`/api/applications/${encodeURIComponent(String(applicationId))}?depth=2`);
        const volunteer = app?.volunteer;
        const event = app?.event;
        const org = typeof event?.organization === 'object' ? event.organization : null;
        // As wolontariusz, partner to organizator
        const name = org?.organizationName || [org?.firstName, org?.lastName].filter(Boolean).join(' ').trim();
        setPartnerName(name || 'Organizator');
      } catch {}
    };
    loadPartner();
  }, [applicationId, canChat]);

  // Push title to native header
  useEffect(() => {
    const title = partnerName ? `Czat z “${partnerName}”` : 'Czat';
    // @ts-ignore
    navigation.setOptions?.({ title });
  }, [navigation, partnerName]);

  useEffect(() => {
    if (!canChat) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const latest = await getMessages(String(applicationId));
        if (latest && latest.length) {
          const last = lastTimestampRef.current;
          const newOnes = last
            ? latest.filter(m => new Date(m.createdAt).getTime() > new Date(last).getTime())
            : latest;
          if (newOnes.length) {
            setMessages(prev => (prev.length ? [...prev, ...newOnes] : latest));
            lastTimestampRef.current = latest[latest.length - 1].createdAt;
            setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true } as any), 50);
          }
        }
      } catch {}
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [applicationId, canChat]);

  const onSend = useCallback(async () => {
    if (!canChat) return;
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendMessage(String(applicationId), text);
      setInput('');
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true } as any), 50);
    } finally {
      setSending(false);
    }
  }, [applicationId, input, canChat]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    const mine = item?.sender?.relationTo === 'users' && String(item?.sender?.value) === String(user?.id || '')
    const bg = mine ? c.pink : '#E6E6E6'
    const textColor = mine ? '#FFFFFF' : '#4B5563'
    return (
      <View style={{ paddingVertical: 6, alignItems: mine ? 'flex-end' : 'flex-start' }}>
        <View style={{ maxWidth: '86%', backgroundColor: bg, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 }}>
          <Text style={{ color: textColor }}>{item.content}</Text>
        </View>
        <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 4, textAlign: mine ? 'right' : 'left' }}>
          {new Date(item.createdAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }, [user]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}

        {!canChat ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#374151' }}>Brak kontekstu czatu</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={listRef as any}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16, gap: 16 }}
              onContentSizeChange={() => setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true } as any), 10)}
            />
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#EFEFEF',
                  borderRadius: 18,
                  paddingLeft: 14,
                  paddingRight: 8,
                  paddingVertical: 8,
                }}
              >
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Napisz wiadomość..."
                  multiline
                  style={{ flex: 1, minHeight: 40, maxHeight: 120, color: '#111827' }}
                />
                <TouchableOpacity
                  onPress={onSend}
                  disabled={sending || !input.trim()}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#E7E7E7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8,
                  }}
                >
                  <Ionicons name="send" size={22} color={sending || !input.trim() ? '#9CA3AF' : c.magenta} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}


