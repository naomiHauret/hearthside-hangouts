import { ListItem, Paragraph, YStack, XStack, SizableText, Avatar, Circle } from '@my/ui'
import { uriToUrl } from 'app/helpers'
import { UserProfile, useUserProfile } from 'app/hooks'
import { format, fromUnixTime } from 'date-fns'

interface PostProps {
  content: string
  creator: UserProfile
  id: string
  createdAt: number
}

export const Post = (props: PostProps) => {
  const { post } = props
  const { queryUserProfile } = useUserProfile({
    shouldFetchMemberships: false,
    shouldFetchProfile: true,
    userEthereumAddress: post.creator.id,
  })
  return (
    <ListItem
      bg="$backgroundTransparent"
      borderStyle="solid"
      borderWidth="$0.25"
      borderColor="$color7"
    >
      <YStack>
        <XStack ai="center" space="$1">
          {queryUserProfile?.data?.avatarURI && queryUserProfile?.data?.avatarURI !== '' ? (
            <Avatar circular size="$1">
              <Avatar.Image src={uriToUrl(queryUserProfile?.data?.avatarURI)} />
              <Avatar.Fallback bc="$gray6" />
            </Avatar>
          ) : (
            <Circle bc="$gray6" size="$2" />
          )}

          <Paragraph color="$color9" size="$1">
            {queryUserProfile?.data?.displayName} posted
          </Paragraph>
        </XStack>

        <Paragraph py="$2">{post?.content}</Paragraph>
        <XStack></XStack>
        <SizableText theme="alt1" size="$1">
          - {format(new Date(post.createdAt), 'PPPppp')}
        </SizableText>
      </YStack>
    </ListItem>
  )
}

export default Post
