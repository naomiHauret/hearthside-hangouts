import type { UseMutationResult } from '@tanstack/react-query'
import { TextArea, YStack, Input, Button, Label, Spinner, Group, SizableText } from '@my/ui'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, isDate, getUnixTime, toDate, fromUnixTime } from 'date-fns'
import { Calendar, Clock } from '@tamagui/lucide-icons'

interface FormMilestoneProps {
  label: string
  resetFormOnMutationSuccess: boolean
  defaultValues?: {
    title: string
    notes: string
    startAt: Date
    id?: string
  }
  mutation: UseMutationResult<void, unknown, any, unknown>
}
export const FormMilestone = (props: FormMilestoneProps) => {
  const { defaultValues, resetFormOnMutationSuccess, label, mutation } = props
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')
  const [datepickerValue, setDatepickerValue] = useState(
    defaultValues?.startAt ? new Date(defaultValues?.startAt) : new Date()
  )
  const [startAt, setStartAt] = useState(
    defaultValues?.startAt ? defaultValues?.startAt : getUnixTime(new Date())
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datetimePickerMode, setDatepickerMode] = useState('date')

  return (
    <>
      <YStack pb="$4">
        <Label size="$2" theme="alt2" htmlFor="milestone-title">
          Title
        </Label>
        <Input
          id="milestone-title"
          size="$3"
          value={title}
          onChangeText={setTitle}
          placeholder="Title ..."
        />
      </YStack>
      <YStack pb="$4">
        <SizableText size="$2" theme="alt2">
          Date and time
        </SizableText>
        <Group mb="$1" marginEnd="auto" orientation="horizontal">
          <Group.Item>
            <Button
              size="$3"
              icon={Calendar}
              onPress={() => {
                setDatepickerMode('date')
                setShowDatePicker(true)
              }}
            >
              <Button.Text>Date</Button.Text>
            </Button>
          </Group.Item>
          <Group.Item>
            <Button
              size="$3"
              icon={Clock}
              theme="Input"
              onPress={() => {
                setDatepickerMode('time')
                setShowDatePicker(true)
              }}
            >
              <Button.Text>Time</Button.Text>
            </Button>
          </Group.Item>
        </Group>
        <SizableText color="$color11" size="$2">
          {fromUnixTime(startAt)?.toString()}
        </SizableText>
      </YStack>
      <YStack pb="$4">
        <Label size="$2" theme="alt2" htmlFor="milestone-notes">
          About this milestone
        </Label>
        <TextArea
          numberOfLines={2}
          size="$3"
          id="milestone-notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
        />
      </YStack>

      {showDatePicker === true && (
        <DateTimePicker
          testID="dateTimePicker"
          minimumDate={new Date()}
          /** @ts-ignore */
          mode={datetimePickerMode}
          is24Hour={true}
          value={datepickerValue}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false)
            setDatepickerValue(selectedDate ?? new Date())
            setStartAt(getUnixTime(selectedDate ?? new Date()))
          }}
        />
      )}

      <Button
        disabled={mutation?.isLoading === true}
        onPress={async () => {
          await mutation.mutateAsync({
            id: defaultValues?.id,
            title: title,
            notes: notes,
            startAt: startAt,
          })
          if (mutation.isSuccess && resetFormOnMutationSuccess === true) {
            setTitle('')
            setNotes('')
            // setStartAt(getUnixTime(new Date()))
            // setDatepickerValue(new Date())
          }
        }}
      >
        <Button.Text>{label}</Button.Text>
        {mutation?.isLoading && <Spinner />}
      </Button>
    </>
  )
}

export default FormMilestone
