import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCheckout } from '../../../context/CheckoutContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ScanQRCode() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const scanningRef = useRef(false);  // Biến ref chặn gọi nhiều lần
  const router = useRouter();
  const { employeeId } = useLocalSearchParams<{ employeeId: string }>();
  const { checkIn } = useCheckout();

  useFocusEffect(
    useCallback(() => {
      scanningRef.current = false;  // reset lại mỗi khi vào trang
      setScanned(false);
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanningRef.current || loading) return;

    scanningRef.current = true;
    setScanned(true);
    setLoading(true);

    try {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      let qrCode = data;
      if (data.includes('code=')) {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        qrCode = urlParams.get('code') || '';
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(qrCode)) {
        throw new Error('Invalid QR code format');
      }

      await checkIn(employeeId, qrCode);
      Alert.alert('Success', 'Check-in successful!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)/check-in');
          }
        }
      ]);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already checked in')) {
          router.replace('/(tabs)/check-in');
        } else {
          Alert.alert('Error', error.message || 'Failed to check-in. Please try again.', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/check-in');
              }
            }
          ]);
        }
      } else {
        Alert.alert('Error', 'Failed to check-in. Please try again.', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/check-in');
            }
          }
        ]);
      }
    } finally {
      setLoading(false);
      scanningRef.current = false;
    }
  };

  // Khi bấm "Scan Again", reset luôn ref này
  const handleScanAgain = () => {
    scanningRef.current = false;
    setScanned(false);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>Scan QR code to check-in</Text>
          {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}
        </View>
      </CameraView>
      <View style={styles.buttonContainer}>
        <Button
          title="Back to Check-in"
          onPress={() => router.replace('/(tabs)/check-in')}
          color="#666"
        />
        {scanned && !loading && (
          <Button
            title="Tap to Scan Again"
            onPress={handleScanAgain}
            color="#007AFF"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
});
