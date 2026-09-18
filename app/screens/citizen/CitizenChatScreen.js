import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../../utils/api';
import { useResponsive } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CitizenChatScreen() {
  const { theme } = useAppTheme();

  const navigation = useNavigation();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [botTyping, setBotTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const result = await api.citizen.getChatMessages();
      if (result.messages) {
        setMessages(result.messages);
      }
    } catch (e) {
      console.error('Failed to load chat messages', e);
      if (e.message === 'Session expired. Please log in again.') {
        Alert.alert('Session Expired', 'Please log in again to continue.', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    setBotTyping(true);
    try {
      const result = await api.citizen.sendChatMessage(input.trim());
      const newMessage = {
        id: result.chatMessageId || Date.now(),
        senderRole: 'citizen',
        message: input.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setMessages(prev => [...prev, newMessage]);
      setInput('');

      if (result.botResponse) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            senderRole: 'staff',
            message: result.botResponse,
            createdAt: new Date().toISOString(),
            isRead: false,
          }]);
          setBotTyping(false);
          scrollToBottom();
        }, 800);
      } else {
        setBotTyping(false);
      }
      scrollToBottom();
    } catch (e) {
      if (e.message === 'Session expired. Please log in again.') {
        Alert.alert('Session Expired', 'Please log in again to continue.', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ]);
      } else {
        Alert.alert('Error', e.message || 'Failed to send message');
      }
      setBotTyping(false);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (msg) => {
    const isCitizen = msg.senderRole === 'citizen';
    return (
      <View key={msg.id} style={[styles(responsive, theme).messageRow, isCitizen ? styles(responsive, theme).citizenRow : styles(responsive, theme).staffRow]}>
        {!isCitizen && (
          <View style={styles(responsive, theme).avatar}>
            <Ionicons name="person" size={16} color={theme.white} />
          </View>
        )}
        <View style={[styles(responsive, theme).bubble, isCitizen ? styles(responsive, theme).citizenBubble : styles(responsive, theme).staffBubble]}>
          <Text style={[styles(responsive, theme).messageText, isCitizen ? styles(responsive, theme).citizenText : styles(responsive, theme).staffText]}>{msg.message}</Text>
          <Text style={styles(responsive, theme).messageTime}>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
        </View>
        {isCitizen && (
          <View style={styles(responsive, theme).avatar}>
            <Ionicons name="person" size={16} color={theme.white} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles(responsive, theme).centerContainer}>
        <Text style={styles(responsive, theme).loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles(responsive, theme).container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
      <View style={[styles(responsive, theme).header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles(responsive, theme).backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
          <Text style={styles(responsive, theme).backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles(responsive, theme).headerInfo}>
          <Text style={styles(responsive, theme).title}>Chat with Office</Text>
          <Text style={styles(responsive, theme).subtitle}>Women Representative Support Team</Text>
        </View>
        <View style={styles(responsive, theme).statusDot} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles(responsive, theme).chatArea}
        contentContainerStyle={styles(responsive, theme).chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.length === 0 ? (
          <View style={styles(responsive, theme).empty}>
            <View style={styles(responsive, theme).emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.textMuted} />
            </View>
            <Text style={styles(responsive, theme).emptyTitle}>Start a conversation</Text>
            <Text style={styles(responsive, theme).emptySubtitle}>Send a message to the Women Representative office and we'll get back to you.</Text>
          </View>
        ) : (
          <>
            {messages.map(renderMessage)}
            {botTyping && (
              <View style={styles(responsive, theme).typingRow}>
                <View style={styles(responsive, theme).avatar}>
                  <Ionicons name="person" size={16} color={theme.white} />
                </View>
                <View style={styles(responsive, theme).typingBubble}>
                  <View style={styles(responsive, theme).typingDots}>
                    <View style={styles(responsive, theme).dot} />
                    <View style={styles(responsive, theme).dot} />
                    <View style={styles(responsive, theme).dot} />
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles(responsive, theme).inputRow, { paddingBottom: Math.max(insets.bottom, responsive.verticalPadding) }]}>
        <TextInput
          style={styles(responsive, theme).input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[styles(responsive, theme).sendBtn, (!input.trim() || sending) && styles(responsive, theme).sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || sending}>
          <Ionicons name="send" size={20} color={theme.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (responsive, theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontSize: 16, color: theme.textSecondary, marginTop: 16 },
  header: { padding: responsive.verticalPadding, paddingTop: responsive.verticalPadding, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  backBtnText: { color: theme.text, fontSize: 16, marginLeft: 4 },
  headerInfo: { flex: 1 },
  title: { fontSize: responsive.sectionHeaderSize, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.success, marginLeft: 8 },
  chatArea: { flex: 1, backgroundColor: theme.background },
  chatContent: { padding: responsive.horizontalPadding, paddingTop: responsive.verticalPadding },
  empty: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.chipBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  citizenRow: { justifyContent: 'flex-end' },
  staffRow: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  citizenBubble: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  staffBubble: { backgroundColor: theme.surface, borderBottomLeftRadius: 4, boxShadow: "0 1 4 0 ${theme.shadow}", elevation: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  citizenText: { color: theme.white },
  staffText: { color: theme.text },
  messageTime: { fontSize: 11, marginTop: 4, color: theme.textMuted },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: responsive.horizontalPadding, paddingBottom: responsive.verticalPadding, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  input: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, backgroundColor: theme.background, color: theme.text, maxHeight: 120, marginRight: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  sendBtnDisabled: { opacity: 0.5 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  typingBubble: { backgroundColor: theme.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderBottomLeftRadius: 4, boxShadow: "0 1 4 0 ${theme.shadow}", elevation: 2 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.textMuted },
});
