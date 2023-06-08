import { H1, H2, Paragraph, YStack } from '@my/ui'
import SignInForm from './Form'

/**
 * Universal screen. Allows the user to sign in to the app via Magic SDK.
 * @returns Sign in page
 */
export function SignInScreen() {
  return (
    <YStack flexGrow={1} jc="center" ai="center" p="$4" space>
      <YStack space="$4">
        <YStack space="$1">
          <H2 ta="center">🏕️</H2>

          <H1 ta="center">Your cozy bookish banters awaits.</H1>
        </YStack>
        <Paragraph ta="center">
          Sign-in to join book clubs and connect with fellow readers on Hearthside Hangouts !
        </Paragraph>
        <YStack>
          <SignInForm />
        </YStack>
      </YStack>
    </YStack>
  )
}
