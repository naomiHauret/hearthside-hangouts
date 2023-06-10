import { SizableText, Tabs, H5, Separator, TabsContentProps } from '@my/ui'
import { useState } from 'react'

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
  return (
    <>
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
          <H5 textAlign="center">My clubs screen</H5>
        </TabsContent>
        <TabsContent value="tab2">
          <H5 textAlign="center">Explore clubs screen</H5>
        </TabsContent>
      </Tabs>
    </>
  )
}
