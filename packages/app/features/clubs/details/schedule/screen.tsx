import { formatRelative, fromUnixTime, isFuture } from 'date-fns'
import type { RatedSourceMaterial, Milestone } from '../../../../hooks'
import { YGroup, ListItem, SizableText, Paragraph, Separator } from '@my/ui'
import RSVPButton from './RSVPButton'

interface ScheduleProps {
  material: RatedSourceMaterial | undefined
  milestones: Milestone[] | undefined
  canAccessEvents: boolean
}
export const Schedule = (props: ScheduleProps) => {
  const { milestones, club, canAccessEvents, material } = props

  return (
    <YGroup bordered separator={<Separator />}>
      {milestones?.map((milestone: Milestone) => {
        return (
          <YGroup.Item key={`detailed-schedule-${milestone.id}`}>
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
              {isFuture(fromUnixTime(milestone.startAt)) && canAccessEvents && (
                <RSVPButton club={club} material={material} milestone={milestone} />
              )}
            </ListItem>
          </YGroup.Item>
        )
      })}
    </YGroup>
  )
}

export default Schedule
