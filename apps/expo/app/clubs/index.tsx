import React from 'react'
import { ClubsScreen } from 'app/features/clubs/screen'
import { ScreenScrollView } from '../../components/ScreenScrollview'

export default function Screen() {
  return (
    <>
      <ScreenScrollView useWindowScrolling={true}>
        <ClubsScreen />
      </ScreenScrollView>
    </>
  )
}
