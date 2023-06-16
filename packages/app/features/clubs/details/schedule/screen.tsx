import { format, isPast, isDate, toDate, fromUnixTime } from 'date-fns'
import type { RatedSourceMaterial, Milestone } from '../../../../hooks'
import { YGroup, ListItem, SizableText, Paragraph, Separator } from '@my/ui'

interface ScheduleProps {
  material: RatedSourceMaterial | undefined
  milestones: Milestone[] | undefined
}
export const Schedule = (props: ScheduleProps) => {
  const { milestones } = props
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
                  {format(fromUnixTime(milestone.startAt), 'PPPP')} -{' '}
                  {format(fromUnixTime(milestone.startAt), 'p z')}
                </SizableText>
              }
            >
              {milestone?.notes?.trim()?.length > 0 && (
                <Paragraph pt="$2" size="$2">
                  {milestone.notes}
                </Paragraph>
              )}
            </ListItem>
          </YGroup.Item>
        )
      })}
    </YGroup>
  )
}

export default Schedule
