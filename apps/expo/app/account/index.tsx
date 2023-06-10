import React from 'react'
import { AccountScreen } from 'app/features/account/screen'
import { Stack } from 'expo-router'
import { ScrollView } from '@my/ui'

export default function Screen() {
  return (
    <>
      <ScrollView>
        <Stack.Screen />
        <AccountScreen />
      </ScrollView>
    </>
  )
}
