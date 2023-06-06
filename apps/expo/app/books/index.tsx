import React from 'react'

import { BooksScreen } from 'app/features/books/screen'
import { Stack } from 'expo-router'
import { ScreenScrollView } from '../../components/ScreenScrollview'

export default function Screen() {
  return (
    <>
      <ScreenScrollView useWindowScrolling={true}>
        <Stack.Screen />
        <BooksScreen />
      </ScreenScrollView>
    </>
  )
}
