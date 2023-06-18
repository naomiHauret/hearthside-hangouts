import React from 'react'
import {
  YGroup,
  ListItem,
  H3,
  Paragraph,
  Button,
  Sheet,
  YStack,
  Separator,
  VisuallyHidden,
  SizableText,
} from '@my/ui'
import { useStoreClubPosts } from 'app/provider'
import Post from './Post'

export const ChannelScreen = (props) => {
  const channel = useStoreClubPosts((s) => s.selectedChannel)
  const { posts } = props
  return (
    <YStack f={1} flexGrow={1} pb="$-20">
      <H3>{channel?.title}</H3>
      <YGroup pt="$6" gap="$2">
        {posts?.map((postRawData) => {
          const post = postRawData.data
          return (
            <YGroup.Item key={`post-${post.id}`}>
              <Post post={post} />
            </YGroup.Item>
          )
        })}
      </YGroup>
    </YStack>
  )
}

export default ChannelScreen
