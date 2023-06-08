import { createConfigForm, defaultComponents, defaultHelpers } from 'tamagui-react-hook-form'
import { Button, Spinner, Label, YStack, Avatar } from '@my/ui'
import { useFilepickerImage } from '../../hooks'

const createForm = createConfigForm(defaultComponents, defaultHelpers)

interface FormValues {
  publicEthAddress: string
  displayName: string
  bio: string
  avatarURI: any
}

const Form = createForm<FormValues>()

interface FormProps {
    labelTrigger: string 
    defaultValues: FormValues
    statusOnSubmit: "error" | "idle" | "loading" | "success"
    onSubmit: (values: FormValues) => Promise<void>
}
export const FormProfile = (props: FormProps) => {
  const { labelTrigger, statusOnSubmit, defaultValues, onSubmit } = props
  const avatarPicker = useFilepickerImage(defaultValues.avatarURI)

  return (
    <YStack
        
      $gtSm={{
        maxWidth: 480,
      }}
      pb="$4"
    >
      <Form
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        width="100%"
        marginHorizontal="auto"
        gap="$4"
      >
        <YStack pt="$4" pb="$1" jc="center" ai="center" space>
           <Avatar onPress={avatarPicker.pickImage} circular borderColor="$color8" borderWidth="$0.5" size="$12">
                <Avatar.Image src={avatarPicker?.imageUri} />
                <Avatar.Fallback bc="$backgroundHover" />
            </Avatar>
            <Button onPress={avatarPicker.pickImage} theme="alt2" size="$2">
                <Button.Text size="$1" fontWeight="bold">Pick avatar</Button.Text>
            </Button>
        </YStack>
        <YStack>
          <Label htmlFor="displayName">Your display name</Label>
          <Form.Input
            type="text"
            placeholderColor="$color9"
            placeholder="Type your name..."
            borderWidth="$0.5"
            borderStyle="solid"
            name="displayName"
            id="displayName"
          />
        </YStack>
        <YStack>
          <Label htmlFor="bio">Your bio</Label>
          <Form.TextArea
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
            {statusOnSubmit === 'loading'&&
            <Spinner color="$color12" size="small" />
            }
          </Button>

        </Form.Trigger>
      </Form>
    </YStack>
  )
}

export default FormProfile
