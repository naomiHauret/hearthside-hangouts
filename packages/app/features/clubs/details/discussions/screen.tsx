import { formatRelative, fromUnixTime, isFuture, isToday } from 'date-fns'
import type { RatedSourceMaterial, Milestone } from '../../../../hooks'
import { YGroup, XStack, ListItem, SizableText, Paragraph, H5, Separator, Button } from '@my/ui'
import { Mic } from '@tamagui/lucide-icons'

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
          isToday(fromUnixTime(milestone.startAt)) && isFuture(fromUnixTime(milestone.startAt))
      )?.length > 0 && (
        <>
          <XStack ai="center" space="$2" theme="alt2" pb="$2">
            <Mic size="$1" />
            <H5 theme="alt2" fontWeight="bold" size="$1">
              Later today
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
                          {formatRelative(fromUnixTime(milestone.startAt), new Date())}
                        </SizableText>
                      }
                    >
                      {milestone?.notes?.trim()?.length > 0 && (
                        <Paragraph pt="$2" size="$2">
                          {milestone.notes}
                        </Paragraph>
                      )}
                      {canAccessEvents && (
                        <Button size="$3" mt="$4">
                          <Button.Text fontWeight="bold" t>
                            Join convo
                          </Button.Text>
                        </Button>
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
