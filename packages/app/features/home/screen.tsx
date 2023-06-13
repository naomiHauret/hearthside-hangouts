import { Button, H1, Paragraph, XStack, YStack } from '@my/ui'
import { useCurrentUser } from 'app/hooks'
import React from 'react'
import { useLink } from 'solito/link'

export function HomeScreen() {
  const { userInfo, mutationSignOut, queryIsCurrentUserConnected } = useCurrentUser()

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <YStack space="$4" maw={600}>
        {queryIsCurrentUserConnected?.isLoading && <Paragraph>...</Paragraph>}
        <H1 ta="center">Welcome to Hearthside Hangouts ! {userInfo?.publicAddress} </H1>
        <XStack>
          {userInfo?.publicAddress && (
            <Button onPress={async () => await mutationSignOut.mutateAsync()}>Sign out</Button>
          )}
        </XStack>
      </YStack>
    </YStack>
  )
}
