import { H1, H2, Paragraph, YStack } from '@my/ui'
import SignInForm from './Form'
import { useRouter } from 'solito/router'
import { useEffect } from 'react'
import { useCurrentUser } from 'app/hooks'

/**
 * Universal screen. Allows the user to sign in to the app via Magic SDK.
 * @returns Sign in page
 */
export function SignInScreen() {
  const { push } = useRouter()
  const { userInfo } = useCurrentUser()

  useEffect(() => {
    if (userInfo?.publicAddress) {
      push('/')
    }
  }, [userInfo?.publicAddress])

  return (
    <YStack flexGrow={1} jc="center" ai="center" px="$4" space>
      <YStack space="$2">
        <YStack space="$1">
          <H2 pt="$8" ta="center">
            🏕️
          </H2>

          <H1 size="$6" fontFamily="$body" fontWeight="bold" ta="center">
            Your cozy bookish banters awaits.
          </H1>
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
