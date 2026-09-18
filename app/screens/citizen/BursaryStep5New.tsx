import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useBursaryStore, DocumentFile, DOCUMENT_REQUIREMENTS } from '../../store/bursaryStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { pickDocument } from '../../utils/fileUpload';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function BursaryStep5() {
  const { theme, responsive } = useAppTheme();
  const { form, addDocument, updateDocument, removeDocument } = useBursaryStore();
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());

  const handlePick = async (docReq: typeof DOCUMENT_REQUIREMENTS[0]) => {
    const existing = form.documents.find((d) => d.documentType === docReq.key);
    if (existing) {
      // Offer to replace
      Alert.alert(
        'Replace Document',
        `"${existing.name}" is already attached. Replace it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: () => pickAndUpload(docReq) },
        ]
      );
      return;
    }
    pickAndUpload(docReq);
  };

  const pickAndUpload = async (docReq: typeof DOCUMENT_REQUIREMENTS[0]) => {
    const file = await pickDocument(false);
    if (!file || Array.isArray(file)) return;

    const fileId = `${docReq.key}_${Date.now()}`;
    const doc: DocumentFile = {
      id: fileId,
      name: file.name,
      uri: file.uri,
      type: file.type,
      fileSize: file.fileSize,
      uploading: false,
      uploaded: false,
      required: docReq.required,
      documentType: docReq.key,
    };

    addDocument(doc);
    setUploadingIds((prev) => new Set(prev).add(fileId));

    // Simulate upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 0.3;
      if (progress >= 1) {
        progress = 1;
        clearInterval(interval);
        updateDocument(fileId, { uploading: false, uploaded: true, uploadingError: undefined });
        setUploadingIds((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
      } else {
        updateDocument(fileId, { uploading: true, uploadProgress: progress });
      }
    }, 200);
  };

  const handleRemove = (docId: string) => {
    Alert.alert('Remove Document', 'Are you sure you want to remove this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeDocument(docId);
        },
      },
    ]);
  };

  const handlePreview = async (doc: DocumentFile) => {
    if (doc.uri) {
      try {
        await Sharing.shareAsync(doc.uri);
      } catch (e) {
        Alert.alert('Preview', 'Unable to preview this file.');
      }
    }
  };

  const getDocStatus = (docReq: typeof DOCUMENT_REQUIREMENTS[0]) => {
    const doc = form.documents.find((d) => d.documentType === docReq.key);
    if (!doc) return 'pending';
    if (doc.uploading) return 'uploading';
    if (doc.uploaded) return 'complete';
    return 'pending';
  };

  return (
    <View style={{ flex: 1 }}>
      {DOCUMENT_REQUIREMENTS.map((docReq) => {
        const doc = form.documents.find((d) => d.documentType === docReq.key);
        const status = getDocStatus(docReq);
        const isUploading = uploadingIds.has(doc ? doc.id : '');

        return (
          <View key={docReq.key} style={styles.docGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>
                {docReq.label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {docReq.required && <Ionicons name="information-circle" size={14} color={theme.danger} />}
                {docReq.required ? <Text style={{ fontSize: 11, color: theme.danger }}>Required</Text> : <Text style={{ fontSize: 11, color: theme.textMuted }}>Optional</Text>}
              </View>
            </View>

            {doc ? (
              <View style={[styles.uploadedCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {doc.type?.startsWith('image') ? (
                    <Image source={{ uri: doc.uri }} style={styles.thumbnail} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumbnail, { backgroundColor: theme.chipBg, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="document-text" size={32} color={theme.textMuted} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>{doc.name}</Text>
                    {doc.fileSize ? <Text style={[styles.fileSize, { color: theme.textMuted }]}>{formatFileSize(doc.fileSize)}</Text> : null}
                    {doc.uploadProgress !== undefined && doc.uploadProgress < 1 && (
                      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                        <View style={[styles.progressFill, { width: `${doc.uploadProgress * 100}%`, backgroundColor: theme.primary }]} />
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={styles.docActionBtn} onPress={() => handlePreview(doc)}>
                    <Ionicons name="eye-outline" size={18} color={theme.info} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.docActionBtn} onPress={() => handleRemove(doc.id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.docActionBtn} onPress={() => handlePick(docReq)}>
                    <Ionicons name="reload-outline" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.pickBtn, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}
                onPress={() => handlePick(docReq)}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={24} color={theme.primary} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.primary, marginLeft: 8 }}>
                  {docReq.required ? 'Upload Required' : 'Upload Optional'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <View style={{ backgroundColor: theme.surface, borderRadius: responsive.cardRadius, padding: responsive.cardPadding, marginTop: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 }}>Upload Status</Text>
        {form.documents.length === 0 ? (
          <Text style={{ fontSize: 13, color: theme.textSecondary }}>No documents uploaded yet.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {form.documents.map((doc) => (
              <View key={doc.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: theme.text }}>{doc.name}</Text>
                {doc.uploaded ? (
                  <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                ) : doc.uploading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Ionicons name="close-circle" size={18} color={theme.danger} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function formatFileSize(bytes: number) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  docGroup: { marginBottom: 20 },
  uploadedCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  thumbnail: { width: 56, height: 56, borderRadius: 8 },
  fileName: { fontSize: 14, fontWeight: '500' },
  fileSize: { fontSize: 12, marginTop: 2 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 2 },
  docActionBtn: { padding: 6 },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
  },
});
