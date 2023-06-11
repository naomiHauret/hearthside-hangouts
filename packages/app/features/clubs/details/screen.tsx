import { Button, H1, Header, Image, Paragraph, ScrollView, XStack, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { uriToUrl } from 'app/helpers'
import { useClubs, useUserProfile } from 'app/hooks'
import React from 'react'
import { createParam } from 'solito'
import { useLink } from 'solito/link'

const { useParam } = createParam<{ id: string }>()

export function ClubDetailScreen() {
  const [id] = useParam('id')
  const { queryClub } = useClubs(id)
  const moderator = useUserProfile(queryClub?.data?.creator?.id)
  return (
    <YStack space="$4">
      <Header space="$6">
        <XStack maxWidth={980} aspectRatio={1.25 / 1} bg="$backgroundFocus">
          {queryClub?.data?.coverURI && queryClub?.data?.coverURI !== '' && (
            <Image
              source={{ uri: uriToUrl(queryClub?.data?.coverURI) }}
              width="100%"
              height="100%"
            />
          )}
        </XStack>
        <YStack px="$3">
          <H1 fontFamily="$heading">{queryClub?.data?.name}</H1>
          <Paragraph>{queryClub?.data?.description}</Paragraph>
          <Paragraph>Moderated by {moderator?.queryUserProfile?.data?.displayName}</Paragraph>
        </YStack>
      </Header>
    </YStack>
  )
}
