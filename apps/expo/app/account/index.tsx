import React from 'react'

import { AccountScreen } from 'app/features/account/screen'
import { Stack } from 'expo-router'
import { ScreenScrollView } from '../../components/ScreenScrollview'

export default function Screen() {
  return (
    <>
      <ScreenScrollView useWindowScrolling={true}>
        <Stack.Screen />
        <AccountScreen />
      </ScreenScrollView>
    </>
  )
}
