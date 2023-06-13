import type { Polybase } from '@polybase/client'

import {
  Avatar,
  Button,
  Circle,
  H1,
  Header,
  Image,
  Paragraph,
  ScrollView,
  SizableText,
  Spinner,
  Text,
  VisuallyHidden,
  XStack,
  YStack,
  ZStack,
} from '@my/ui'
import { Cog, Users } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { uriToUrl } from 'app/helpers'
import { useClubs, useCurrentUser, useUserProfile } from 'app/hooks'
import { usePolybase } from 'app/provider'
import React from 'react'
import { createParam } from 'solito'
import { LinearGradient } from 'tamagui/linear-gradient'
import { isAddress } from 'ethers/lib/utils'

const { useParam } = createParam<{ id: string }>()

/**
 * Universal screen that displays a club details, allows the moderator to update its details, set its materials, and allow other users to join/leave it.
 * @returns Club details page
 */
export function ClubDetailScreen() {
  const [id] = useParam('id')
  const { userInfo } = useCurrentUser()
  const { queryClub, queryClubMembers, mutationJoinClub, mutationDestroyMembership } = useClubs(id)
  const polybaseDb = usePolybase((s) => s.db) as Polybase

  /**
   * Query ; checks if a given UserProfile<ethereumAddress> is a member of a Club <idClub>
   *
   */
  const queryIsCurrentUserMember = useQuery({
    queryKey: ['membership', `${userInfo?.publicAddress}/${id}`],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubMembership')
      const record = await collectionReference
        .record(`${userInfo?.publicAddress}/${id}` as string)
        .get()
      return record
    },

    enabled:
      !isAddress(`${userInfo?.publicAddress}`) || !id || id === null || !polybaseDb ? false : true,
  })

  const moderator = useUserProfile({
    userEthereumAddress: queryClub?.data?.creator?.id,
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
  })

  return (
    <YStack>
      <Header space="$6">
        <ZStack f={1} flexGrow={1} maxWidth={980} aspectRatio={1.25 / 1} bg="$color8">
          <XStack fullscreen f={1} flexGrow={1} bg="$green7">
            {queryClub?.data?.coverURI && queryClub?.data?.coverURI !== '' && (
              <Image
                source={{ uri: uriToUrl(queryClub?.data?.coverURI) }}
                width="100%"
                height="100%"
              />
            )}
          </XStack>
          <LinearGradient
            f={1}
            flexGrow={1}
            colors={['$backgroundPress', 'transparent']}
            start={[0, 1.008]}
            end={[0, 0]}
          />
        </ZStack>
        <XStack mt="$-5" px="$3">
          <YStack>
            <H1 fontFamily="$heading">{queryClub?.data?.name}</H1>
          </YStack>
          <XStack pt="$6">
            {moderator?.queryUserProfile?.data?.id &&
              userInfo?.publicAddress === moderator?.queryUserProfile?.data?.id && (
                <Button icon={Cog} circular>
                  <Button.Text>
                    <VisuallyHidden>Update club info</VisuallyHidden>
                  </Button.Text>
                </Button>
              )}
          </XStack>
        </XStack>
      </Header>
      <YStack pt="$3" px="$3">
        <Paragraph pb="$4" theme="alt1">
          {queryClub?.data?.description}
        </Paragraph>

        <XStack jc="space-between" ai="flex-end">
          <YStack>
            <XStack ai="center">
              <Users color="$color9" size="$1" />
              <Paragraph color="$color9" size="$1" paddingStart="$2">
                {queryClubMembers?.data?.count} member
                {(queryClubMembers?.data?.count ?? 1) > 1 && 's'}
              </Paragraph>
            </XStack>

            <XStack pt="$2" paddingEnd="$4" ai="center" space="$3">
              <SizableText size="$1" theme="alt2">
                Ran by
              </SizableText>
              <XStack
                py="$1.5"
                paddingStart="$1.5"
                paddingEnd="$3"
                borderRadius="$12"
                bg="$backgroundStrong"
                space="$2"
              >
                {moderator?.queryUserProfile?.data?.avatarURI &&
                moderator?.queryUserProfile?.data?.avatarURI !== '' ? (
                  <Avatar circular size="$2">
                    <Avatar.Image src={uriToUrl(moderator?.queryUserProfile?.data?.avatarURI)} />
                    <Avatar.Fallback bc="$gray6" />
                  </Avatar>
                ) : (
                  <Circle bc="$gray6" size="$2" />
                )}
                <SizableText color="$color12" size="$2" fontWeight="bold">
                  {moderator?.queryUserProfile?.data?.displayName}
                </SizableText>
              </XStack>
            </XStack>
          </YStack>
          {userInfo?.publicAddress &&
            moderator?.queryUserProfile?.data?.id &&
            moderator?.queryUserProfile?.data?.id !== userInfo?.publicAddress && (
              <Button
                disabled={[
                  queryIsCurrentUserMember.isLoading,
                  mutationDestroyMembership.isLoading,
                  mutationJoinClub.isLoading,
                ].includes(true)}
                themeInverse
              >
                <Button.Text
                  onPress={async () => {
                    if (queryIsCurrentUserMember?.data?.data?.id) {
                      await mutationDestroyMembership.mutateAsync({
                        idClub: queryIsCurrentUserMember?.data?.data?.id,
                      })
                    } else {
                      await mutationJoinClub.mutateAsync({ idClub: id as string })
                    }
                  }}
                  fontWeight="bold"
                >
                  {queryIsCurrentUserMember?.data?.data?.id ? (
                    <>{mutationDestroyMembership.isLoading ? 'Leaving...' : 'Leave'}</>
                  ) : (
                    <>{mutationJoinClub.isLoading ? 'Joining...' : 'Join'}</>
                  )}
                </Button.Text>
                {[
                  queryIsCurrentUserMember?.isLoading,
                  mutationDestroyMembership.isLoading,
                  mutationJoinClub.isLoading,
                ].includes(true) && <Spinner />}
              </Button>
            )}
        </XStack>
      </YStack>
    </YStack>
  )
}
