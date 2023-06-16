# 🏕️ 🔥 Hearthside Hangouts

a cozy, (audio 🔊) bookclub app.

- 🏕️ Create your club
- 📚 Set the reading list of your club
- 📅 Plan out reading and discussion milestones
- 🗣️ Discuss and read with yout book buddies in dedicated audio rooms

## 📱🧑‍💻 Get started with Hearthside Hangouts mobile app (Expo app, dev mode)

> **Pre-requisites:**
>
> - have `yarn` installed on your machine ;
> - have the Expo Go app installed on your phone ; ([Learn more from on Expo website](https://expo.dev/client))
> - have an EAS (Expo Application Services) account ; ([Sign up here](https://expo.dev/signup))
> - have `eas-cli` installed on your machine ; ([eas-cli Github](https://github.com/expo/eas-cli))
> - A Magic Auth API Key (+ OAuth keys for the social logins you want to use ; eg: Google OAuth API key etc)
> - A Polybase db that follows the schema defined in `./schemas/collectionV1.ts`
> - A Web3.Storage API Key
> - A Google Books API Key
> - A Huddle01 API Key and project ID
> - A Livepeer API Key

- Install dependencies: `yarn`
- In `apps/expo`, run `eas project:init` and initialize a project
- If alls goes well in the previous step, you should see this in your terminal :

```
✔ Would you like to create a project for @<your-eas-account-name>/hearthsidehangouts? … yes
✔ Created @<your-eas-account-name>/hearthsidehangouts
✔ Project successfully linked (ID: <id-of-your-newly-created-project>) (modified app.json)
```

- Check `apps/expo/app.json` ; the `"projectId"` field should have the ID the `eas-cli` printed in the previous step as its value ; **if not, redo the previous step.**
- Still in `apps/expo`, create a `.env.local` file (copy/paste the content of `.env.dist`)
- Still in `apps/expo`, run the following command `eas secret:push --scope project --env-file .env.local` ;

> Make sure to run `eas secret:push --scope project --env-file .env.local` **every time you change your .env.local file !**

- Still in `apps/expo`, verify that your secret environment variables were created by running `eas secret:list` ; your terminal should print something like this :

```
eas secret:list

Secrets for this account and project:
ID          <some-id-abc-def>
Name        MAGIC_KEY
Scope       project
Type        STRING
Updated at  <some-date>

———

ID           <some-id-xyz-lmn>
Name        POLYBASE_DEFAULT_NAMESPACE
Scope       project
Type        STRING
Updated at  <some-date>
```

- If you followed all the previous steps properly, you should be good to go ! Go back to the root of the project
- To run expo locally in dev mode, run `yarn native`
- Your terminal should print something like this :

```
Starting Metro Bundler
Tunnel connected.
Tunnel ready.
█▀▀▀▀▀█ ▄ █ ▀ ▄▄▀ █▀▀▀▀▀█
█ ███ █ ▄▄▄ █▄██  █ ███ █
█ ▀▀▀ █ ▄█ ▄▄▀▀▄▄ █ ▀▀▀ █
▀▀▀▀▀▀▀ ▀▄█▄▀ ▀▄█ ▀▀▀▀▀▀▀
██▀█▀ ▀▀▀▀▄▀▄▀█ ▄▀ █ ▀▄▀
▄ ▀  █▀▄▄ ▀ ▄  ▀█▀▄ ▀▀ ██
█▀ █▄ ▀▀██▀ ▀█▀ ▄▀▀█▀▀█▀▀
█ ██▀█▀██▀▄█▀▀█▀ ▀███▀ ▀█
▀   ▀ ▀▀▄██▀█▀ ▀█▀▀▀█▀█
█▀▀▀▀▀█ ▀▀▀ █   █ ▀ █▄▀██
█ ███ █ █▄█▄ ▀▀██▀█▀██▀▄▄
█ ▀▀▀ █ █   █ ▄▄▄ ▄█▄▀  █
▀▀▀▀▀▀▀ ▀ ▀  ▀▀   ▀▀  ▀▀▀

› Choose an app to open your project at http://<random-string>.<your-eas-account-name>.19000.exp.direct/_expo/loading
› Metro waiting on exp://<random-string>.<your-eas-account-name>.19000.exp.direct
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu

› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.
```

- In your phone open the Expo go app
- In the Expo Go app, scan the QR code from the console or write the URL
- Enjoy !

## About

- Profile, clubs, materials (books), club activity, milestones... data management: [Polybase](https://polybase.xyz) ;
- File upload (pictures, pdf, audio): [web3.storage](https://web3.storage/) API ;
- Live group audio chat: [Livepeer](https://livepeer.org) & Livekit UI ;
- Authentication/wallet: [Magic](https://magic.link/) Auth SDK ;

## About the starter

---

> This project was bootstrapped using the tamagui universal app starter.

# Tamagui + Solito + Next + Expo Monorepo

```sh
npm create tamagui
```

## 🔦 About

This monorepo was bootstrapped with `npm create tamagui`, a universal app (mobile + web) built with Expo + Next.js + Tamagui + Solito app.

Many thanks to [@FernandoTheRojo](https://twitter.com/fernandotherojo) for the Solito starter monorepo which this was forked from. Check out his [talk about using expo + next together at Next.js Conf 2021](https://www.youtube.com/watch?v=0lnbdRweJtA).

## 📦 Included packages

- [Tamagui](https://tamagui.dev) 🪄
- [solito](https://solito.dev) for cross-platform navigation
- Expo SDK
- Next.js
- Expo Router

## 🗂 Folder layout

The main apps are:

- `expo` (native)
- `next` (web)

- `packages` shared packages across apps
  - `ui` includes custom UI kit that will be optimized by Tamagui
  - `app` most files will be importedf from `app/`
    - `features` (don't use a `screens` folder. organize by feature.)
    - `helpers` helper functions that are used across different parts of the applications (provide common functionality or perform specific tasks that can be reused throughout the codebase)
    - `hooks`custom hooks that are used across different parts of the applications
    - `provider` (all the providers that wrap the app, and some no-ops for Web.)

Adding other folders inside of `packages/` is possible (if you have a good reason to.)

## 🏁 Start the app

- Install dependencies: `yarn`

- Next.js local dev: `yarn web`

To run with optimizer on in dev mode (just for testing, it's faster to leave it off): `yarn web:extract`. To build for production `yarn web:prod`.

To see debug output to verify the compiler, add `// debug` as a comment to the top of any file.

- Expo local dev: `yarn native`

## UI Kit

Note we're following the [design systems guide](https://tamagui.dev/docs/guides/design-systems) and creating our own package for components.

See `packages/ui` named `@my/ui` for how this works.

## 🆕 Add new dependencies

### Pure JS dependencies

If you're installing a JavaScript-only dependency that will be used across platforms, install it in `packages/app`:

```sh
cd packages/app
yarn add date-fns
cd ../..
yarn
```

### Native dependencies

If you're installing a library with any native code, you must install it in `expo`:

```sh
cd apps/expo
yarn add react-native-reanimated
cd ..
yarn
```

## Update new dependencies

### Pure JS dependencies

```sh
yarn upgrade-interactive
```

You can also install the native library inside of `packages/app` if you want to get autoimport for that package inside of the `app` folder. However, you need to be careful and install the _exact_ same version in both packages. If the versions mismatch at all, you'll potentially get terrible bugs. This is a classic monorepo issue. I use `lerna-update-wizard` to help with this (you don't need to use Lerna to use that lib).

You may potentially want to have the native module transpiled for the next app. If you get error messages with `Cannot use import statement outside a module`, you may need to use `transpilePackages` in your `next.config.js` and add the module to the array there.

### Deploying to Vercel

- Root: `./apps/next`
- Install command to be `yarn set version berry && yarn install`
- Build command: leave default setting
- Output dir: leave default setting
