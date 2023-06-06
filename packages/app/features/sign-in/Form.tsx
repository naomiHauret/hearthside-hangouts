import { createConfigForm, defaultComponents, defaultHelpers } from 'tamagui-react-hook-form'
import { Button, Spinner, Label, YStack, Paragraph, Separator } from '@my/ui'
import { useCurrentUser } from 'app/hooks'

const createForm = createConfigForm(defaultComponents, defaultHelpers)

interface FormValues {
  emailMagicLink: string
}

const Form = createForm<FormValues>()

export const FormSignIn = () => {
  const { mutationSignIn, userInfo } = useCurrentUser()
  return (
    <YStack
      $gtSm={{
        maxWidth: 480,
      }}
      pb="$4"
    >
      <Form
        disabled={mutationSignIn.isLoading}
        onSubmit={async (value) => {
          mutationSignIn.mutateAsync({
            method: 'email',
            value: value.emailMagicLink,
          })
        }}
        width="100%"
        marginHorizontal="auto"
        gap="$4"
      >
        <YStack borderRadius="$4" bg="$backgroundHover" p="$4">
          <Label htmlFor="emailMagicLink">Your email address</Label>
          <Form.Input
            type="email"
            placeholderColor="$color9"
            placeholder="Type your email..."
            borderWidth="$0.5"
            borderStyle="solid"
            name="emailMagicLink"
            id="emailMagicLink"
          />
        </YStack>
        <Form.Trigger asChild>
          <Button disabled={mutationSignIn.isLoading} themeInverse={true}>
            {mutationSignIn.isLoading && mutationSignIn.variables?.method === 'email' ? (
              <>
                <Button.Text fontWeight="bold">Sending...</Button.Text>
                <Spinner color="$color12" size="small" />
              </>
            ) : (
              <Button.Text fontWeight="bold">Send magic link</Button.Text>
            )}
          </Button>
        </Form.Trigger>
      </Form>
      <Separator />
      <Paragraph
        py="$3"
        color="$color11"
        fontSize={10}
        ta="center"
        fontWeight="bold"
        tt="uppercase"
      >
        Or
      </Paragraph>

      <YStack gap="$4">
        <Button
          disabled={mutationSignIn.isLoading}
          onPress={async () =>
            await mutationSignIn.mutateAsync({
              method: 'google',
            })
          }
        >
          {mutationSignIn.isLoading && mutationSignIn.variables?.method === 'google' ? (
            <>
              <Button.Text fontWeight="bold">...</Button.Text>
              <Spinner color="$color12" size="small" />
            </>
          ) : (
            <Button.Text fontWeight="bold">Continue with Google</Button.Text>
          )}
        </Button>
        <Button
          disabled={mutationSignIn.isLoading}
          onPress={async () =>
            await mutationSignIn.mutateAsync({
              method: 'github',
            })
          }
        >
          {mutationSignIn.isLoading && mutationSignIn.variables?.method === 'github' ? (
            <>
              <Button.Text fontWeight="bold">...</Button.Text>
              <Spinner color="$color12" size="small" />
            </>
          ) : (
            <Button.Text fontWeight="bold">Continue with Github</Button.Text>
          )}
        </Button>
      </YStack>
    </YStack>
  )
}

export default FormSignIn
