import { uriToUrl } from 'app/helpers'
import { Club, useClubMaterial, useSourceMaterial } from '../../../hooks'
import { useUserProfile } from '../../../hooks'
import { Card, XStack, Paragraph, H2, YStack, Avatar, Circle, Image, VisuallyHidden } from '@my/ui'
import { useLink } from 'solito/link'

interface CardClubModeratorProps {
  club: Club
}
export const CardClubModerator = (props: CardClubModeratorProps) => {
  const { club } = props

  const { queryUserProfile } = useUserProfile({
    userEthereumAddress: club.creator.id,
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
  })
  const linkClub = useLink({
    href: `/clubs/${club.id}`,
  })

  const { queryClubMaterialDetails } = useClubMaterial({
    shouldFetchClubMaterial: true,
    idClubMaterial: club?.currentClubMaterial as string,
  })

  const { querySourceMaterial } = useSourceMaterial({
    id: queryClubMaterialDetails?.data?.material?.id as string,
    shouldFetchMaterial: true,
  })

  return (
    <Card position="relative" elevate size="$4" bordered {...linkClub}>
      <Card.Header flexDirection="row" ai="center" padded>
        <YStack
          elevation="$1"
          overflow="hidden"
          borderRadius="$2"
          width={80}
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
        <YStack width="75%" paddingStart="$4" gap="$2" flexDirection="column">
          <Paragraph theme="alt1" size="$1">
            {querySourceMaterial?.data?.title && `Reading "${querySourceMaterial?.data?.title}"`}
          </Paragraph>

          <H2 size="$8" tt="none">
            {club.name}
          </H2>
          <XStack space="$2">
            {queryUserProfile?.data?.avatarURI && queryUserProfile?.data?.avatarURI !== '' ? (
              <Avatar circular size="$2">
                <Avatar.Image src={uriToUrl(queryUserProfile?.data?.avatarURI)} />
                <Avatar.Fallback bc="$gray6" />
              </Avatar>
            ) : (
              <Circle bc="$gray6" size="$2" />
            )}

            <Paragraph color="$color9" size="$1">
              Ran by you
            </Paragraph>
          </XStack>
        </YStack>
      </Card.Header>
      <Card.Footer>
        <VisuallyHidden>
          <Paragraph>Go to club details</Paragraph>
        </VisuallyHidden>
      </Card.Footer>
    </Card>
  )
}

export default CardClubModerator
