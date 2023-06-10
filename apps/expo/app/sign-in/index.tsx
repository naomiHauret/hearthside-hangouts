import React from 'react'

import { SignInScreen } from 'app/features/sign-in/screen'
import { ScrollView } from '@my/ui'

export default function Screen() {
  return (
    <>
      <ScrollView>
        <SignInScreen />
      </ScrollView>
    </>
  )
}
