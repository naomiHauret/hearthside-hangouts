import type { MagicUserMetadata,  } from '@magic-sdk/types';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { providers } from 'ethers';
import  { Polybase } from '@polybase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { create } from 'zustand'
import { signMessage } from '../../helpers/wallet';
import { useMagicWallet } from '../../provider/magic-wallet';
import { usePolybase } from '../../provider/polybase';

/**
 * zustand store to get/set the current user's information via Magic SDK
 */
const useCurrentUserStore = create<{
  userInfo: undefined | MagicUserMetadata,
  setUserInfo: (newValue: undefined | MagicUserMetadata) => void
}>((set) => ({
  userInfo: undefined,
  setUserInfo: (newValue: undefined | MagicUserMetadata) => set(() => ({ userInfo: newValue })),
}))

/**

  Auth & current user's information hook
  @returns {{
    userInfo: undefined | MagicUserMetadata,
    mutationSignIn: UseMutationResult<MagicUserMetadata | undefined, unknown, { method: string; value?: string | undefined; }, unknown>,
    mutationSignOut: UseMutationResult<boolean, unknown, void, unknown>,
    queryCurrentUserInfo: UseQueryResult<MagicUserMetadata | undefined, unknown>
    }} - The current user information and mutation/query results.
*/
export function useCurrentUser(): {
  userInfo: undefined | MagicUserMetadata
  mutationSignIn: UseMutationResult<MagicUserMetadata | undefined, unknown, { method: string; value?: string | undefined; }, unknown>,
  mutationSignOut: UseMutationResult<boolean, unknown, void, unknown>,
  queryCurrentUserInfo: UseQueryResult<MagicUserMetadata |  undefined, unknown>,
} {
    const queryClient = useQueryClient()
    const polybaseDbDefaultNamespace = usePolybase((s) => s.defaultNamespace)
    const setPolybaseDb = usePolybase((s) => s.setDb)
    const magic = useMagicWallet((s) => s.magic)
    const walletClient = useMagicWallet((s) => s.walletClient)
    const setUserInfo = useCurrentUserStore((state) => state.setUserInfo)
    const userInfo = useCurrentUserStore((state) => state.userInfo)

    /**
    * Mutation that signs the user through Magic SDK. Upon a successful authentication, we set the user info and add a signer to our Polybase db instance.
    */
    const mutationSignIn = useMutation({
      mutationFn: async (args: {
        method: string,
        value?: string
      }) => {

        if(args.method === 'email') {
          await magic?.auth.loginWithMagicLink({ email: args?.value as string });
        }
        const res = await magic?.user.getInfo();
        return res
        
      },
      async onSuccess(data) {
        setUserInfo(data)
        queryClient.setQueryData(['is-connected'], () => true)
        queryClient.setQueryData(['current-user'], () => data)
      },
    })
  

    /**
    * Mutation that signs out the user through Magic SDK. Upon a successful sign out, we set the user info to `undefined` and remove the signer from our Polybase db instance.
    */
    const mutationSignOut = useMutation({
      mutationFn: async () => {
        const isDisconnected = await magic?.wallet.disconnect()
        return isDisconnected ?? false
      }, 
      async onSuccess(isDisconnected) { 
        if(isDisconnected === true) {
          setUserInfo(undefined)
          queryClient.setQueryData(['is-connected'], () => false)
          queryClient.setQueryData(['current-user'], () => undefined)
          const db = new Polybase({ defaultNamespace: polybaseDbDefaultNamespace })
          setPolybaseDb(db)  
        }
      }
    })

    /**
    * Query that verifies if the current user is logged in via Magic SDK ; set Polybase signer if the user is connected. Triggered every time the window is focused
    */
    const queryIsCurrentUserConnected = useQuery(({
        queryKey: ['is-connected'],
        queryFn: async () =>  await magic?.user.isLoggedIn(),
        refetchOnWindowFocus: true,
        async onSuccess(data) {
          const signer = await walletClient?.getSigner(userInfo?.publicAddress as string) as providers.JsonRpcSigner
          const db = new Polybase({ defaultNamespace: polybaseDbDefaultNamespace })
  
          db.signer(async (data: string) => {      
            const sig = await signMessage({
              signer,
              message: data,
            })  
            return { h: "eth-personal-sign", sig: sig.signature }
          })
          setPolybaseDb(db)
  
        }
     }))

    /**
    * Query that gets the currently connected user's information via Magic SDK. Triggered when `queryIsCurrentUserConnected` returns `true` (aka when the user is connected.)
    */
    const queryCurrentUserInfo = useQuery({
        queryKey: ['current-user'],
        queryFn: async () =>  await magic?.user.getInfo(),
        onSuccess(data) {
          if(data) setUserInfo(data)
        },
        onError() {
          setUserInfo(undefined)
        },
        enabled: queryIsCurrentUserConnected?.data === true ? true : false,
     })

    return {
        userInfo,
        mutationSignIn,
        mutationSignOut,
        queryCurrentUserInfo,
    }
}
export default useCurrentUser