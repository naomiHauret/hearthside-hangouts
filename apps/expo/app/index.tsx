import { HomeScreen } from 'app/features/home/screen'
import { ScreenScrollView } from '../components/ScreenScrollview'

export default function Screen() {
  return (
    <ScreenScrollView useWindowScrolling={true}>
      <HomeScreen />
    </ScreenScrollView>
  )
}
