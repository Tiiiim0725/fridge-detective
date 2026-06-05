// app/dev-user-profile-check.tsx
// Dev-only page for User Profile Module v0.1 minimum链路 verification

import React, { useState } from 'react'
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native'
import { ensureAuthUser } from '@/services/authService'
import {
  ensureProfile,
  saveUserPreferences,
  saveKitchenEquipment,
  savePantryItems,
  getOnboardingContext,
} from '@/services/profileService'

type CheckStatus = 'idle' | 'running' | 'success' | 'error'

export default function DevUserProfileCheck() {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [result, setResult] = useState<unknown | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runUserProfileCheck = async () => {
    setStatus('running')
    setResult(null)
    setErrorMessage(null)

    try {
      // Step 1: Ensure auth user
      const authUser = await ensureAuthUser()

      // Step 2: Ensure profile exists
      const profile = await ensureProfile()

      // Step 3: Save user preferences
      const preferences = await saveUserPreferences({
        portionSize: 'normal',
        spiceLevel: 'mild',
        saltiness: 'normal',
        cuisinePreferences: ['chinese', 'korean'],
        mealStylePreferences: ['quick_easy', 'budget'],
        dietTags: [],
        dislikedIngredientKeys: ['cilantro'],
        allergenKeys: [],
      })

      // Step 4: Save kitchen equipment
      const equipment = await saveKitchenEquipment({
        equipmentKeys: ['pot', 'pan', 'rice_cooker', 'knife', 'cutting_board'],
      })

      // Step 5: Save pantry items
      const pantry = await savePantryItems({
        pantryItemKeys: ['cooking_oil', 'salt', 'soy_sauce', 'rice', 'instant_noodles'],
      })

      // Step 6: Get complete onboarding context
      const onboardingContext = await getOnboardingContext()

      // Build final result
      const finalResult = {
        authUser,
        profile,
        preferences,
        equipmentKeys: equipment.map((item) => item.equipmentKey),
        pantryItemKeys: pantry.map((item) => item.pantryItemKey),
        onboardingContext,
      }

      setResult(finalResult)
      setStatus('success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>User Profile Dev Check</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Run User Profile Check"
            onPress={runUserProfileCheck}
            disabled={status === 'running'}
          />
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: </Text>
          <Text
            style={[
              styles.statusValue,
              status === 'idle' && styles.statusIdle,
              status === 'running' && styles.statusRunning,
              status === 'success' && styles.statusSuccess,
              status === 'error' && styles.statusError,
            ]}
          >
            {status}
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        )}

        {result !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result:</Text>
            <ScrollView horizontal style={styles.resultScroll}>
              <Text style={styles.resultJson}>{JSON.stringify(result, null, 2)}</Text>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusIdle: {
    color: '#888888',
  },
  statusRunning: {
    color: '#ffaa00',
  },
  statusSuccess: {
    color: '#00cc66',
  },
  statusError: {
    color: '#ff4444',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#ff8888',
    lineHeight: 20,
  },
  resultContainer: {
    backgroundColor: 'rgba(0, 204, 102, 0.05)',
    borderWidth: 1,
    borderColor: '#00cc66',
    borderRadius: 8,
    padding: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00cc66',
    marginBottom: 8,
  },
  resultScroll: {
    maxHeight: 400,
  },
  resultJson: {
    fontSize: 11,
    color: '#aaffaa',
    fontFamily: 'monospace',
  },
})
