import type { FileToUpload } from '../../hooks'
import {
  Button,
  Spinner,
  Label,
  YStack,
  ToggleGroup,
  Text,
  Image,
  VisuallyHidden,
  Paragraph,
  Sheet,
  ZStack,
  XStack,
} from '@my/ui'
import { createConfigForm, defaultComponents, defaultHelpers } from 'tamagui-react-hook-form'
import { useFilepickerImage } from '../../hooks'
import { GENRES } from 'app/helpers/hearthside-hangouts'
import { Square, CheckSquare, ChevronDown } from '@tamagui/lucide-icons'
import { useState } from 'react'

const createForm = createConfigForm(defaultComponents, defaultHelpers)

interface FormDefaultValues {
  name: string
  description: string
  genres: Array<string>
  coverURI: string
  openToNewMembers: boolean
}
export interface FormValues extends FormDefaultValues {
  idClub?: string
  coverFile?: FileToUpload | undefined | null
}

const Form = createForm<FormValues>()

interface FormProps {
  labelTrigger: string
  defaultValues: FormValues
  statusOnSubmit: 'error' | 'idle' | 'loading' | 'success'
  onSubmit: (values: FormValues) => Promise<void>
}

export const FormClub = (props: FormProps) => {
  const { labelTrigger, statusOnSubmit, defaultValues, onSubmit } = props
  const [position, setPosition] = useState(0)
  const [isPickGenresOpen, setIsPickGenresOpen] = useState(false)
  const [genres, setGenres] = useState([...defaultValues?.genres])
  /**
   * File picker for the cover image of the club
   */
  const coverPicker = useFilepickerImage({
    defaultImageSrc: defaultValues.coverURI,
    aspect: [2, 1],
  })
  return (
    <YStack
      $gtSm={{
        maxWidth: 480,
      }}
      pb="$4"
    >
      <Form
        defaultValues={defaultValues}
        onSubmit={(values) => {
          onSubmit({
            ...values,
            coverFile: coverPicker?.imageFile,
            genres,
          })
        }}
        width="100%"
        marginHorizontal="auto"
        gap="$4"
      >
        <YStack pt="$4" pb="$1" jc="center" ai="center" space>
          <XStack width="$20" aspectRatio={1.91 / 1} bg="$backgroundFocus">
            {coverPicker?.imageUri && coverPicker?.imageUri !== '' && (
              <Image source={{ uri: coverPicker?.imageUri }} width="100%" height="100%" />
            )}
          </XStack>
          <Button onPress={coverPicker.pickImage} theme="alt2" size="$2">
            <Button.Text size="$1" fontWeight="bold">
              Pick cover
            </Button.Text>
          </Button>
        </YStack>
        <YStack>
          <Label htmlFor="name">Club name</Label>
          {/* @ts-ignore */}
          <Form.Input
            type="text"
            placeholderColor="$color9"
            placeholder="Type your club name..."
            borderWidth="$0.5"
            borderStyle="solid"
            name="name"
            id="name"
          />
        </YStack>
        <YStack>
          <Label htmlFor="description">A few words about your club</Label>
          <VisuallyHidden>
            <Paragraph>A few words about your club...</Paragraph>
          </VisuallyHidden>
          {/* @ts-ignore */}
          <Form.TextArea
            placeholderColor="$color9"
            borderWidth="$0.5"
            borderStyle="solid"
            name="description"
            id="description"
          />
        </YStack>
        <YStack>
          <Label htmlFor="genres">Select the genres your club will focus on</Label>
          <Button
            color="$color9"
            bg="$backgroundInput"
            borderWidth="$0.5"
            borderStyle="solid"
            iconAfter={ChevronDown}
            onPress={() => setIsPickGenresOpen(true)}
          >
            <Button.Text>
              {genres?.length > 0 ? 'Change selection' : 'Pick at least 1 genre'}
            </Button.Text>
          </Button>
          <Paragraph>{genres.map((g) => `${GENRES[g]} `)}</Paragraph>
          <Sheet
            forceRemoveScrollEnabled={isPickGenresOpen}
            modal={true}
            open={isPickGenresOpen}
            onOpenChange={setIsPickGenresOpen}
            snapPoints={[90]}
            dismissOnSnapToBottom
            position={position}
            onPositionChange={setPosition}
            zIndex={100_000}
            animation="bouncy"
          >
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame flex={1} space="$5">
              <ZStack flex={1}>
                <Sheet.ScrollView space>
                  <YStack f={1} flexGrow={1} pt="$4" px="$2">
                    <Label pt="$4" size="$5" fontWeight="bold" htmlFor="genres">
                      {genres?.length > 0 ? `${genres?.length} selected` : 'Pick at least 1 genre'}
                    </Label>
                  </YStack>
                  <ToggleGroup
                    onValueChange={(values) => setGenres(values)}
                    p="$2"
                    size="$4"
                    display="flex"
                    flexWrap="wrap"
                    jc="center"
                    id="genres"
                    type="multiple"
                    orientation="horizontal"
                  >
                    {Object.keys(GENRES).map((genre) => {
                      return (
                        <ToggleGroup.Item
                          borderColor="$colorTransparent"
                          orientation="horizontal"
                          key={`club-${genre}`}
                          aria-label={GENRES[genre]}
                          value={genre}
                        >
                          {genres.includes(genre) ? <CheckSquare /> : <Square />}
                          <Text paddingStart="$3" paddingEnd="$2">
                            {GENRES[genre]}
                          </Text>
                        </ToggleGroup.Item>
                      )
                    })}
                  </ToggleGroup>
                </Sheet.ScrollView>
                <YStack mt="auto">
                  <XStack bg="$backgroundHover">
                    <Button mx="auto" chromeless onPress={() => setIsPickGenresOpen(false)}>
                      <Button.Text>Go back</Button.Text>
                    </Button>
                  </XStack>
                </YStack>
              </ZStack>
            </Sheet.Frame>
          </Sheet>
        </YStack>
        <Form.Trigger asChild>
          <Button themeInverse theme="alt2" disabled={statusOnSubmit === 'loading'}>
            <Button.Text fontWeight="bold">{labelTrigger}</Button.Text>
            {statusOnSubmit === 'loading' && <Spinner color="$color12" size="small" />}
          </Button>
        </Form.Trigger>
      </Form>
    </YStack>
  )
}

export default FormClub
