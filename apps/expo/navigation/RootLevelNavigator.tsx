import { Tabs } from 'expo-router'
import { Home, Tent, UserCircle2, BookMarked } from '@tamagui/lucide-icons'
import { useCurrentUser } from 'app/hooks'
import { useTheme } from '@my/ui'

export const RootLevelNavigator = () => {
  const { userInfo } = useCurrentUser()
  const theme = useTheme()
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme?.color12.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: () => <Home />,
          // tabBarBadge: notification
        }}
      />
      <Tabs.Screen
        name="clubs/index"
        options={{
          title: 'Clubs',
          tabBarIcon: () => <Tent />,
          headerShown: true,
          headerTitleAllowFontScaling: true,
          headerTitleStyle: {
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontWeight: '700',
          },
        }}
      />
      <Tabs.Screen
        name="books/index"
        options={{
          title: 'Books',
          tabBarIcon: () => <BookMarked />,
          headerShown: true,
          headerTitleAllowFontScaling: true,
          headerTitleStyle: {
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontWeight: '700',
          },
        }}
      />
      <Tabs.Screen
        name="sign-in/index"
        options={{
          title: 'Profile',
          href: userInfo?.publicAddress ? null : '/sign-in',
          headerShown: false,
          tabBarIcon: () => <UserCircle2 />,
        }}
      />
      <Tabs.Screen
        name="account/index"
        options={{
          title: 'Profile',
          href: !userInfo?.publicAddress ? null : '/account',
          tabBarIcon: () => <UserCircle2 />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="clubs/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="user/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

export default RootLevelNavigator
