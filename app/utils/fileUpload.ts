import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  fileSize?: number;
}

export async function pickDocument(multiple = false): Promise<PickedFile | PickedFile[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    if (multiple) {
      return result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
        fileSize: asset.size,
      }));
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType || 'application/octet-stream',
      fileSize: asset.size,
    };
  } catch (error) {
    console.error('Document picker error:', error);
    return null;
  }
}

export async function getFileInfo(uri: string): Promise<{ exists: boolean; size?: number }> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return { exists: info.exists, size: info.exists ? info.size : undefined };
  } catch {
    return { exists: false };
  }
}
