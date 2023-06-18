import { addHours, formatRelative, fromUnixTime, isFuture, isToday } from 'date-fns'
import type { Club, Milestone } from '../../../../hooks'
import {
  YGroup,
  XStack,
  YStack,
  ListItem,
  SizableText,
  Paragraph,
  H5,
  Separator,
  Text,
} from '@my/ui'
import { Mic } from '@tamagui/lucide-icons'
import JoinButton from './JoinButton'
import ClubPostsChannel from './ClubPostsChannel'
import React from 'react'
import SheetChannel from './channel/Sheet'

interface PostsScreenProps {
  idClubMaterial: string | undefined
  milestones: Milestone[] | undefined
  canAccessEvents: boolean
  club: Club
}
export const PostsScreen = (props: PostsScreenProps) => {
  const { milestones, canAccessEvents, idClubMaterial, club } = props
  return (
    <>
      {milestones?.filter(
        (milestone: Milestone) =>
          isToday(fromUnixTime(milestone?.startAt as number)) &&
          isFuture(addHours(fromUnixTime(milestone?.startAt as number), 3))
      )?.length > 0 && (
        <>
          <XStack ai="center" space="$2" theme="alt2" pb="$2">
            <Mic size="$1" />
            <H5 theme="alt2" fontWeight="bold" size="$1">
              Today
            </H5>
          </XStack>

          <YGroup bordered separator={<Separator />}>
            {milestones
              ?.filter((milestone: Milestone) => isToday(fromUnixTime(milestone.startAt)))
              ?.map((milestone: Milestone) => {
                return (
                  <YGroup.Item key={`happening-today-${milestone.id}`}>
                    <ListItem
                      hoverTheme
                      title={<SizableText fontWeight="bold">{milestone.title}</SizableText>}
                      subTitle={
                        <SizableText theme="alt1" size="$2">
                          starting {formatRelative(fromUnixTime(milestone.startAt), new Date())}
                        </SizableText>
                      }
                    >
                      {milestone?.notes?.trim()?.length > 0 && (
                        <Paragraph pt="$2" size="$2">
                          {milestone.notes}
                        </Paragraph>
                      )}
                      {canAccessEvents && (
                        <YStack pt="$2">
                          <JoinButton roomId={milestone.id} />
                        </YStack>
                      )}
                    </ListItem>
                  </YGroup.Item>
                )
              })}
          </YGroup>
        </>
      )}

      <XStack ai="center" space="$2" pt="$8" theme="alt2" pb="$2">
        <Text size="$1" />
        <H5 theme="alt2" fontWeight="bold" size="$1">
          Club discussions
        </H5>
      </XStack>

      <YStack pb="$6">
        <YGroup bordered separator={<Separator />}>
          <ClubPostsChannel
            idClubMaterial={idClubMaterial}
            id={`${idClubMaterial}/hangout`}
            title="Club hangout"
          />
        </YGroup>
      </YStack>
      <Separator />
      <XStack ai="center" space="$2" pt="$6" theme="alt2" pb="$2">
        <Text size="$1" />
        <H5 theme="alt2" fontWeight="bold" size="$1">
          Book discussions
        </H5>
      </XStack>
      <YGroup bordered separator={<Separator />}>
        {milestones?.map((milestone: Milestone) => {
          return (
            <ClubPostsChannel
              id={`thread-posts-${milestone.id}`}
              idClubMaterial={idClubMaterial}
              id={`${idClubMaterial}/${milestone.id}`}
              title={milestone.title}
            />
          )
        })}
      </YGroup>

      <YStack mt="$6">
        <YGroup bordered separator={<Separator />}>
          <ClubPostsChannel
            idClubMaterial={idClubMaterial}
            id={`${idClubMaterial}/reviews`}
            title="Reviews"
          />
        </YGroup>
      </YStack>

      <SheetChannel club={club} />
    </>
  )
}

export default PostsScreen
