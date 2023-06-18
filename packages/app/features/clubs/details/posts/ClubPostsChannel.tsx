import { YGroup, ListItem, SizableText, Paragraph, XStack } from '@my/ui'
import { ChevronRight, Lock } from '@tamagui/lucide-icons'
import { useClubPosts } from 'app/hooks'
import { useStoreClubPosts } from 'app/provider'

export const ClubPostsChannel = (props) => {
  const { title, id, canAccess } = props
  const { queryPostsByChannel } = useClubPosts({
    idChannel: id,
  })
  const openChannelSheet = useStoreClubPosts((s) => s.openChannelSheet)
  return (
    <YGroup.Item>
      <ListItem
        onPress={() => {
          if (canAccess) {
            openChannelSheet({
              title,
              id,
            })
          }
        }}
        hoverTheme
        title={<SizableText fontWeight="bold">{title}</SizableText>}
      >
        <XStack theme="alt2" justifyContent="space-between" pt="$2">
          <Paragraph size="$1">
            {queryPostsByChannel?.data?.data?.length} post
            {queryPostsByChannel?.data?.data?.length > 1 && 's'}
          </Paragraph>
          {canAccess ? <ChevronRight opacity={0.25} /> : <Lock size="$1" opacity={0.75} />}
        </XStack>
      </ListItem>
    </YGroup.Item>
  )
}

export default ClubPostsChannel
