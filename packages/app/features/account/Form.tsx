import type { FileToUpload } from '../../hooks'
import { Button, Spinner, Label, YStack, Avatar, VisuallyHidden, Paragraph, Circle } from '@my/ui'
import { createConfigForm, defaultComponents, defaultHelpers } from 'tamagui-react-hook-form'
import { useFilepickerImage } from '../../hooks'
import { uriToUrl } from '../../helpers'

const createForm = createConfigForm(defaultComponents, defaultHelpers)

interface FormDefaultValues {
  publicEthAddress: string
  displayName: string
  bio: string
  avatarURI: string
}
export interface FormValues extends FormDefaultValues {
  avatarFile?: FileToUpload | undefined | null
}

const Form = createForm<FormValues>()

interface FormProps {
  labelTrigger: string
  defaultValues: FormValues
  statusOnSubmit: 'error' | 'idle' | 'loading' | 'success'
  onSubmit: (values: FormValues) => Promise<void>
}
export const FormProfile = (props: FormProps) => {
  const { labelTrigger, statusOnSubmit, defaultValues, onSubmit } = props

  /**
   * File picker for the user account avatar
   */
  const avatarPicker = useFilepickerImage({
    defaultImageSrc: uriToUrl(defaultValues.avatarURI),
    aspect: [1, 1],
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
        onSubmit={(values) =>
          onSubmit({
            ...values,
            avatarFile: avatarPicker?.imageFile,
          })
        }
        width="100%"
        marginHorizontal="auto"
        gap="$4"
      >
        <YStack pt="$4" pb="$1" jc="center" ai="center" space>
          <VisuallyHidden>
            <Paragraph>Select a picture for your avatar by clicking on the button below.</Paragraph>
          </VisuallyHidden>
          {avatarPicker?.imageUri && avatarPicker?.imageUri !== '' ? (
            <Avatar
              onPress={avatarPicker.pickImage}
              circular
              borderColor="$color8"
              borderWidth="$0.5"
              size="$12"
            >
              <Avatar.Image src={avatarPicker?.imageUri} />
              <Avatar.Fallback bc="$gray6" />
            </Avatar>
          ) : (
            <Circle bc="$gray6" size="$12" />
          )}

          <Button onPress={avatarPicker.pickImage} theme="alt2" size="$2">
            <Button.Text size="$1" fontWeight="bold">
              Pick avatar
            </Button.Text>
          </Button>
        </YStack>
        <YStack>
          <Label htmlFor="displayName">Your display name</Label>
          <VisuallyHidden>
            <Paragraph>What should your new friends call you ?</Paragraph>
          </VisuallyHidden>
          {/* @ts-ignore */}
          <Form.Input
            type="text"
            placeholderColor="$color9"
            placeholder="What should your new friends call you ?"
            borderWidth="$0.5"
            borderStyle="solid"
            name="displayName"
            id="displayName"
          />
        </YStack>
        <YStack>
          <Label htmlFor="bio">About you</Label>
          <VisuallyHidden>
            <Paragraph>What should your new friends know about you ?</Paragraph>
          </VisuallyHidden>
          {/* @ts-ignore */}
          <Form.TextArea
            placeholder="What should your new friends know about you ?"
            numberOfLines={2}
            placeholderColor="$color9"
            borderWidth="$0.5"
            borderStyle="solid"
            name="bio"
            id="bio"
          />
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

export default FormProfile
