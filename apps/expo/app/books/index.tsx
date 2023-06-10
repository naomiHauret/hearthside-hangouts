import React from 'react'
import { BooksScreen } from 'app/features/books/screen'
import { Stack } from 'expo-router'
import { ScrollView } from '@my/ui'

export default function Screen() {
  return (
    <>
      <ScrollView>
        <Stack.Screen />
        <BooksScreen />
      </ScrollView>
    </>
  )
}
