import React from 'react'

import { SignInScreen } from 'app/features/sign-in/screen'
import { Stack } from 'expo-router'
import { ScreenScrollView } from '../../components/ScreenScrollview'

export default function Screen() {
  return (
    <>
      <ScreenScrollView useWindowScrolling={true}>
        <SignInScreen />
      </ScreenScrollView>
    </>
  )
}
