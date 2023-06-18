import {
  Button,
  H1,
  Paragraph,
  ScrollView,
  SizableText,
  Spinner,
  Avatar,
  Circle,
  XStack,
  YStack,
} from '@my/ui'
import { shortenEthereumAddress, uriToUrl } from 'app/helpers'
import { useCurrentUser, useUserProfile } from 'app/hooks'
import React from 'react'
import { useLink } from 'solito/link'

export function HomeScreen() {
  const { userInfo, mutationSignOut, queryCurrentUserInfo, queryIsCurrentUserConnected } =
    useCurrentUser()
  const { queryUserProfile } = useUserProfile({
    shouldFetchMemberships: false,
    shouldFetchProfile: userInfo?.publicAddress ? true : false,
    userEthereumAddress: userInfo?.publicAddress as string,
  })
  return (
    <YStack py="$12" mx="auto" maxWidth={400} flexGrow={1} px="$3" space>
      <YStack flexGrow={1}>
        <H1 size="$6" pb="$4" fontFamily="$body" fontWeight="bold" ta="center">
          Welcome to Hearthside Hangouts ! 🏕️
        </H1>
        <Paragraph pb="$4">
          Time to experience a different way to read 📚 Start or join bookclubs that match your vibe
          and (re)discover reading with milestone-based reads and dedicated chapter reviews
          discussions in both text and exclusive audio rooms.
        </Paragraph>
        <YStack alignSelf="center">
          {queryIsCurrentUserConnected?.isLoading && <Spinner />}
          {userInfo?.publicAddress && (
            <>
              <YStack marginEnd="auto">
                <SizableText alignSelf="center" theme="alt2" fontSize={10}>
                  Logged in as
                </SizableText>
                <XStack
                  py="$1"
                  paddingStart="$2"
                  paddingEnd="$4"
                  borderRadius="$12"
                  bg="$backgroundStrong"
                  space="$2"
                  ai="center"
                >
                  {queryUserProfile?.data?.avatarURI && queryUserProfile?.data?.avatarURI !== '' ? (
                    <Avatar circular size="$4">
                      <Avatar.Image src={uriToUrl(queryUserProfile?.data?.avatarURI)} />
                      <Avatar.Fallback bc="$gray6" />
                    </Avatar>
                  ) : (
                    <Circle bc="$gray6" size="$4" />
                  )}
                  <YStack>
                    <SizableText color="$color12" size="$2" fontWeight="bold">
                      {queryUserProfile?.data?.displayName}
                    </SizableText>
                    <SizableText fontSize={10} theme="alt2">
                      ({shortenEthereumAddress(userInfo?.publicAddress)})
                    </SizableText>
                  </YStack>
                </XStack>
              </YStack>
              <Button
                mt="$4"
                size="$2"
                mx="auto"
                onPress={async () => await mutationSignOut.mutateAsync()}
              >
                Sign out
              </Button>
            </>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}
