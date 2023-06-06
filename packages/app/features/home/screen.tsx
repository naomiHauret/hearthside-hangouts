import { Button, H1, XStack, YStack } from '@my/ui'
import { useCurrentUser } from 'app/hooks'
import React from 'react'
import { useLink } from 'solito/link'

export function HomeScreen() {
  const linkProps = useLink({
    href: '/sign-in',
  })

  const { userInfo } = useCurrentUser()

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <YStack space="$4" maw={600}>
        <H1 ta="center">Welcome to Hearthside Hangouts ! {userInfo?.publicAddress} </H1>
        <XStack>
          <Button disabled={userInfo?.publicAddress ? true : false} {...linkProps}>
            Sign in
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}
