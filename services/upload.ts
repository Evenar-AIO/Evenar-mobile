import * as FileSystem from 'expo-file-system';

const DEFAULT_LAN_IP = '192.168.1.3';
const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${DEFAULT_LAN_IP}:5000`;
const API_BASE_URL = RAW_API_BASE_URL
  .replace('localhost', DEFAULT_LAN_IP)
  .replace('127.0.0.1', DEFAULT_LAN_IP);

export async function uploadFile(fileUri: string, name: string) {
  const result = await FileSystem.uploadAsync(`${API_BASE_URL}/upload`, fileUri, {
    httpMethod: 'POST',
    fieldName: 'file',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    parameters: { name },
  });

  return result;
}
