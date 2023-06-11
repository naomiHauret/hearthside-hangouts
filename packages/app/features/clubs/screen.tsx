import {
  SizableText,
  Tabs,
  H5,
  Separator,
  TabsContentProps,
  Button,
  VisuallyHidden,
  YStack,
  ScrollView,
  ZStack,
  H3,
} from '@my/ui'
import { useState } from 'react'
import MyClubsScreen from './my-clubs/screen'
import { Plus } from '@tamagui/lucide-icons'
import { SheetClub, FormClub } from './create'
import { useClubs } from '../../hooks'
import slugify from 'slugify'
/**
 * Universal screen with a tabs navigator. Allows the user to see their clubs and explore other clubs.
 * @returns Clubs page
 */

const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content py="$6" px="$2" flexGrow={1} {...props}>
      {props.children}
    </Tabs.Content>
  )
}

export function ClubsScreen() {
  const [currentTab, setCurrentTab] = useState('tab1')
  const [openSheetClubCreation, setOpenSheetClubCreation] = useState(false)
  const { mutationCreateClub } = useClubs()
  return (
    <ZStack flex={1}>
      <ScrollView fullscreen f={1} flexShrink={0}>
        <Tabs
          flexGrow={1}
          f={1}
          defaultValue="tab1"
          flexDirection="column"
          orientation="horizontal"
          overflow="hidden"
        >
          <Tabs.List
            disablePassBorderRadius="end"
            aria-label="Join or explore clubs"
            flexDirection="row"
          >
            <Tabs.Tab
              onInteraction={() => setCurrentTab('tab1')}
              bg="transparent"
              borderBottomColor={currentTab === 'tab2' ? '$color4' : '$color10'}
              borderRadius={0}
              borderBottomWidth="$1"
              flexGrow={1}
              value="tab1"
            >
              <SizableText color="$color10" fontSize="$1" tt="uppercase" fontWeight="bold">
                My clubs
              </SizableText>
            </Tabs.Tab>
            <Tabs.Tab
              bg="transparent"
              onInteraction={() => setCurrentTab('tab2')}
              borderRadius={0}
              flexGrow={1}
              borderBottomColor={currentTab === 'tab1' ? '$color4' : '$color10'}
              borderBottomWidth="$1"
              value="tab2"
            >
              <SizableText color="$color10" fontSize="$1" tt="uppercase" fontWeight="bold">
                Explore
              </SizableText>
            </Tabs.Tab>
          </Tabs.List>
          <Separator vertical />
          <TabsContent value="tab1">
            <MyClubsScreen />
          </TabsContent>
          <TabsContent value="tab2">
            <H5 textAlign="center">Explore clubs screen</H5>
          </TabsContent>
        </Tabs>
      </ScrollView>
      <YStack maxWidth={980} mb="$4" mt="auto" marginEnd="$2" marginStart="auto">
        <Button
          onPress={() => setOpenSheetClubCreation(true)}
          elevation="$0.25"
          themeInverse
          icon={Plus}
          size="$6"
          circular={true}
        >
          <VisuallyHidden>
            <Button.Text>Create new club</Button.Text>
          </VisuallyHidden>
        </Button>
      </YStack>
      <SheetClub open={openSheetClubCreation} setOpen={setOpenSheetClubCreation}>
        <H3>Create a new club </H3>
        <FormClub
          onSubmit={async (values) => {
            const idClub = `${slugify(values.name)}-${(Math.random() + 1)
              .toString(36)
              .substring(7)})}`
            await mutationCreateClub.mutateAsync({ ...values, idClub })
          }}
          statusOnSubmit={mutationCreateClub.status}
          defaultValues={{
            name: '',
            description: '',
            genres: [],
            coverURI: '',
            openToNewMembers: true,
          }}
          labelTrigger={mutationCreateClub?.isLoading ? 'Creating...' : 'Create club'}
        />
      </SheetClub>
    </ZStack>
  )
}
