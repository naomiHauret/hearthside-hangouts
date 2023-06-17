import { Anchor, Button } from '@my/ui'
import { useState } from 'react'
import { useLink } from 'solito/link'

/**
 * Temporary solution, ideally we would create the call UI directly in the app, or redirect the user in the web version of the app
 */
export const JoinButton = (props) => {
    const { roomId } = props

    return  <>
    <Anchor color="$color12" bg="$backgroundHover" fontWeight="bold" py="$1.5" ta="center" borderRadius="$2" href={`https://app.huddle01.com/${roomId}`}>
      Join
  </Anchor>

  </>
}

export default JoinButton