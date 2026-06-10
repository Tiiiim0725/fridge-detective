import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import {
  addFridgeScanPhoto,
  addManualScanItem,
  confirmFridgeScanItems,
  createGuidedFridgeScan,
  getCurrentFridgeItems,
  getScanItems,
  saveRecognizedScanItems,
} from '@/services/fridgeService'
import { FRIDGE_PHOTO_GUIDE_STEPS } from '@/types/fridge'

type CheckStatus = 'idle' | 'running' | 'success' | 'error'

interface CheckResult {
  scan: unknown
  photo: unknown
  recognizedItems: unknown
  manualItem: unknown
  scanItems: unknown
  confirmedFridgeItems: unknown
  currentFridgeItems: unknown
}

export default function DevFridgeServiceCheck() {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runCheck() {
    setStatus('running')
    setResult(null)
    setError(null)

    try {
      const scan = await createGuidedFridgeScan()
      const guideStep = FRIDGE_PHOTO_GUIDE_STEPS[0]
      const mockStoragePath = `dev/fridge-service-check/${scan.id}/fridge-top-${Date.now()}.jpg`

      const photo = await addFridgeScanPhoto({
        scanId: scan.id,
        storagePath: mockStoragePath,
        photoOrder: guideStep.photoOrder,
        zoneKey: guideStep.zoneKey,
        guidePrompt: guideStep.guidePrompt,
        contentType: 'image/jpeg',
        fileSize: 123456,
        width: 1024,
        height: 768,
      })

      const recognizedItems = await saveRecognizedScanItems({
        scanId: scan.id,
        photoId: photo.id,
        items: [
          {
            rawName: 'egg',
            displayName: '鸡蛋',
            quantityKind: 'count',
            quantityCount: 3,
            quantityText: null,
            confidence: 0.92,
            needsReview: false,
          },
          {
            rawName: 'tomato',
            displayName: '番茄',
            quantityKind: 'count',
            quantityCount: 2,
            quantityText: null,
            confidence: 0.88,
            needsReview: false,
          },
          {
            rawName: 'milk',
            displayName: '牛奶',
            quantityKind: 'text',
            quantityText: '一盒',
            quantityCount: null,
            confidence: 0.8,
            needsReview: true,
            uncertaintyReason: '包装部分遮挡，数量需要确认',
          },
        ],
      })

      const manualItem = await addManualScanItem({
        scanId: scan.id,
        photoId: photo.id,
        rawName: 'cooked rice',
        displayName: '米饭',
        quantityKind: 'text',
        quantityText: '一碗',
        quantityCount: null,
      })

      const scanItems = await getScanItems(scan.id)
      const itemIds = scanItems.map((item) => item.id)
      const confirmedFridgeItems = await confirmFridgeScanItems({
        scanId: scan.id,
        itemIds,
      })
      const currentFridgeItems = await getCurrentFridgeItems()

      setResult({
        scan,
        photo,
        recognizedItems,
        manualItem,
        scanItems,
        confirmedFridgeItems,
        currentFridgeItems,
      })
      setStatus('success')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError))
      setStatus('error')
    }
  }

  function clearResult() {
    setStatus('idle')
    setResult(null)
    setError(null)
  }

  const statusTextStyle = {
    idle: styles.status_idle,
    running: styles.status_running,
    success: styles.status_success,
    error: styles.status_error,
  }[status]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fridge Service Check</Text>
      <Text style={styles.description}>Dev-only check for guided fridge scan service flow.</Text>

      <View style={styles.actions}>
        <Pressable
          disabled={status === 'running'}
          onPress={runCheck}
          style={({ pressed }) => [
            styles.button,
            status === 'running' && styles.buttonDisabled,
            pressed && status !== 'running' && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {status === 'running' ? 'Running...' : 'Run Fridge Service Check'}
          </Text>
        </Pressable>

        <Pressable
          onPress={clearResult}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Clear Result</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.status, statusTextStyle]}>{status}</Text>
      </View>

      {error ? (
        <View style={[styles.card, styles.errorCard]}>
          <Text style={styles.label}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Result</Text>
        <Text style={styles.jsonText}>
          {result ? JSON.stringify(result, null, 2) : 'No result yet.'}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f7f7f2',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d2521',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5f6862',
  },
  actions: {
    gap: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#256d4f',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPressed: {
    backgroundColor: '#1f5b43',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#b6c0b8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  secondaryButtonPressed: {
    backgroundColor: '#eef2ed',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24342b',
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#dde3dc',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  errorCard: {
    borderColor: '#e0a4a4',
    backgroundColor: '#fff5f5',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#56615a',
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 18,
    fontWeight: '700',
  },
  status_idle: {
    color: '#66716a',
  },
  status_running: {
    color: '#8a5b00',
  },
  status_success: {
    color: '#256d4f',
  },
  status_error: {
    color: '#a33838',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#a33838',
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#1f2b24',
  },
})
