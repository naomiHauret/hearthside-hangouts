import { uriToUrl } from 'app/helpers'
import { useClubMaterial, useClubs, useSourceMaterial } from '../../../hooks'
import { useUserProfile } from '../../../hooks'
import { Card, XStack, Paragraph, H2, Image, YStack, Avatar, Circle, VisuallyHidden } from '@my/ui'
import { useLink } from 'solito/link'

interface CardClubMembershipProps {
  idClub: string
}
export const CardClubMembership = (props: CardClubMembershipProps) => {
  const { idClub } = props
  const { queryClub } = useClubs(idClub)
  const { queryClubMaterialDetails } = useClubMaterial({
    shouldFetchClubMaterial: true,
    idClubMaterial: queryClub?.data?.currentClubMaterial as string,
  })

  const { querySourceMaterial } = useSourceMaterial({
    id: queryClubMaterialDetails?.data?.material?.id as string,
    shouldFetchMaterial: true,
  })

  const { queryUserProfile } = useUserProfile({
    userEthereumAddress: queryClub?.data?.creator.id,
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
  })
  const linkClub = useLink({
    href: `/clubs/${idClub}`,
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
            {queryClub?.data?.name}
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
              Ran by {queryUserProfile?.data?.displayName}
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

export default CardClubMembership
