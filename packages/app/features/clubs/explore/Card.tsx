import { GENRES, uriToUrl } from 'app/helpers'
import { Club, useClubMaterial, useClubs, useSourceMaterial } from '../../../hooks'
import { useCurrentUser, useUserProfile } from '../../../hooks'
import {
  Card,
  XStack,
  VisuallyHidden,
  Paragraph,
  H2,
  YStack,
  Image,
  ZStack,
  SizableText,
} from '@my/ui'
import { LinearGradient } from 'tamagui/linear-gradient'
import { Users } from '@tamagui/lucide-icons'
import { useLink } from 'solito/link'

interface CardClubProps {
  club: Club
}
export const CardClub = (props: CardClubProps) => {
  const { club } = props
  const { userInfo } = useCurrentUser()
  const { queryUserProfile } = useUserProfile({
    userEthereumAddress: club?.creator?.id,
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
  })
  const { queryClubMembers } = useClubs(club.id)
  const { queryClubMaterialDetails } = useClubMaterial({
    shouldFetchClubMaterial:
      club?.currentClubMaterial === '' ||
      !club?.currentClubMaterial ||
      club?.currentClubMaterial === null
        ? false
        : true,
    idClubMaterial: club?.currentClubMaterial as string,
  })

  const { querySourceMaterial } = useSourceMaterial({
    id: queryClubMaterialDetails?.data?.material?.id as string,
    shouldFetchMaterial: queryClubMaterialDetails?.data?.material?.id ? true : false,
  })

  const linkClub = useLink({
    href: `/clubs/${club.id}`,
  })

  return (
    <Card elevate size="$4" bordered {...linkClub}>
      <ZStack m="$2" borderRadius="$2" height={200} bg="$color6">
        <YStack overflow="hidden" borderRadius="$2" fullscreen>
          <Image
            borderRadius="$2"
            source={{
              uri: uriToUrl(club?.coverURI),
              height: 200,
            }}
            w="100%"
          />
        </YStack>
        <LinearGradient
          f={1}
          flexGrow={1}
          colors={['$backgroundStrong', 'transparent']}
          start={[0, 0.99]}
          end={[0, 0]}
        />
        <YStack fullscreen>
          <YStack transform={[{ translateY: 15 }]} marginStart="$3" marginEnd="auto" mt="auto">
            <YStack
              elevation="$1"
              overflow="hidden"
              m="auto"
              borderRadius="$2"
              bg="$color6"
              height={120}
            >
              <Image
                borderRadius="$2"
                source={{
                  uri: querySourceMaterial?.data?.thumbnailURI,
                  width: 80,
                  height: 120,
                }}
              />
            </YStack>
          </YStack>
        </YStack>
      </ZStack>
      <YStack>
        <Card.Header padded>
          <H2 size="$8" tt="none">
            {club.name}
          </H2>
          <Paragraph color="$color9" size="$1">
            ran by{' '}
            {queryUserProfile?.data?.id === userInfo?.publicAddress
              ? 'you'
              : queryUserProfile?.data?.displayName}
          </Paragraph>
          <Paragraph pt="$2" size="$1" theme="alt1">
            {club.description}
          </Paragraph>

          <XStack theme="gray" flexWrap="wrap" pt="$4" mt="auto" gap="$2">
            {club.genres.map((genre) => (
              <SizableText
                size="$1"
                px="$2"
                color="$color9"
                borderRadius="$20"
                bg="$backgroundStrong"
                key={`club-${club.id}-tag-${genre}`}
              >
                {GENRES[genre]}
              </SizableText>
            ))}
          </XStack>
        </Card.Header>

        <Card.Footer padded pt={0}>
          <XStack ai="center">
            <Users color="$color9" size="$1" />
            <Paragraph color="$color9" size="$1" paddingStart="$2">
              {queryClubMembers?.data?.count}
              {'  '}people{' '}
              {querySourceMaterial?.data?.title && `reading "${querySourceMaterial?.data?.title}"`}
            </Paragraph>
          </XStack>

          <VisuallyHidden>
            <Paragraph>Go to club details</Paragraph>
          </VisuallyHidden>
        </Card.Footer>
      </YStack>
    </Card>
  )
}

export default CardClub
