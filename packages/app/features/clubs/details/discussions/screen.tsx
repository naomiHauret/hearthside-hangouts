import { addHours, formatRelative, fromUnixTime, isFuture, isToday } from 'date-fns'
import type { RatedSourceMaterial, Milestone } from '../../../../hooks'
import { YGroup, XStack, YStack, ListItem, SizableText, Paragraph, H5, Separator, Button } from '@my/ui'
import { Mic } from '@tamagui/lucide-icons'
import JoinButton from './JoinButton'

interface DiscussionsProps {
  material: RatedSourceMaterial | undefined
  milestones: Milestone[] | undefined
  canAccessEvents: boolean
}
export const Discussions = (props: DiscussionsProps) => {
  const { milestones, canAccessEvents } = props

  return (
    <>
      {milestones?.filter(
        (milestone: Milestone) =>
          isToday(fromUnixTime(milestone.startAt)) && isFuture(addHours(fromUnixTime(milestone.startAt), 3 ))
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
              .map((milestone: Milestone) => {
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
                      {canAccessEvents && (<YStack pt="$2">
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
    </>
  )
}

export default Discussions
