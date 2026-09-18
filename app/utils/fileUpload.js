import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function buildFileObject(asset) {
  const uri = asset.uri;
  const name =
    asset.fileName ||
    uri.split("/").pop() ||
    `upload_${Date.now()}.${asset.mimeType ? asset.mimeType.split("/")[1] : "jpg"}`;
  const type = asset.mimeType || "application/octet-stream";
  return { uri, name, type };
}

function validateSize(asset) {
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
    return false;
  }
  return true;
}

export async function pickDocument(useCamera = false) {
  try {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission required", "Camera access is needed to take a photo.");
        return null;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: false,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "documents"],
        quality: 0.6,
        allowsEditing: false,
      });
    }

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    if (!validateSize(asset)) {
      Alert.alert("File too large", "Each file must be 10MB or smaller.");
      return null;
    }

    return buildFileObject(asset);
  } catch (e) {
    Alert.alert("Error", "Could not pick the file. Please try again.");
    return null;
  }
}

export function emptyFile() {
  return null;
}
