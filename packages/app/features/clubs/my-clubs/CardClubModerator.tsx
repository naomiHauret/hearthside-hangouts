import { uriToUrl } from 'app/helpers'
import { Club, useClubs } from '../../../hooks'
import { useUserProfile } from '../../../hooks'
import { Card, XStack, Paragraph, H2, YStack, Avatar, Circle, Button, VisuallyHidden } from '@my/ui'
import { Users } from '@tamagui/lucide-icons'
import { useLink } from 'solito/link'

interface CardClubModeratorProps {
  club: Club
}
export const CardClubModerator = (props: CardClubModeratorProps) => {
  const { club } = props
  const { queryClubMembers } = useClubs(club.id)
  const { queryUserProfile } = useUserProfile({
    userEthereumAddress: club.creator.id,
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
  })
  const linkClub = useLink({
    href: `/clubs/${club.id}`,
  })

  return (
    <Card position="relative" elevate size="$4" bordered {...linkClub}>
      <Card.Header padded>
        <YStack space="$2" flexDirection="column-reverse">
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

            <Paragraph size="$1">Ran by you</Paragraph>
          </XStack>
        </YStack>
        <Paragraph pt="$2" theme="alt1">
          {club.description}
        </Paragraph>
      </Card.Header>
      <Card.Footer padded pt="$2">
        <XStack ai="center">
          <Users color="$color9" size="$1" />
          <Paragraph color="$color9" size="$1" paddingStart="$2">
            {queryClubMembers?.data?.count}
          </Paragraph>
        </XStack>
        <VisuallyHidden>
          <Paragraph>Go to club details</Paragraph>
        </VisuallyHidden>
      </Card.Footer>
    </Card>
  )
}

export default CardClubModerator
