import type { TabsContentProps } from '@my/ui'
import { Tabs } from '@my/ui'

export const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content py="$6" px="$2" flexGrow={1} {...props}>
      {props.children}
    </Tabs.Content>
  )
}

export default TabsContent
