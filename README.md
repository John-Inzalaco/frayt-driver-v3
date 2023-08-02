## Installation

#### Set Up Font Awesome Pro

- Retrieve our Font Awesome access token
- Set your [NPM config to use that access token](https://fontawesome.com/v6/docs/web/setup/packages#set-up-npm-token-for-all-projects) when accessing the font-awesome/fort-awesome packages

#### Mac

##### Install ASDF

- Follow the [installation instructions](https://asdf-vm.com/guide/getting-started.html) (Bash & Homebrew is likely best)

##### Install NodeJS ASDF plugin

- Run `asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git`
- You may also need to check [the building requirements](https://github.com/nodejs/node/blob/main/BUILDING.md#building-nodejs-on-supported-platforms) if your machine has to build anything from source and runs into issues.
- Consult the [plugin's page](https://github.com/asdf-vm/asdf-nodejs) if you encounter any issues.

##### Install Ruby ASDF plugin

- Ensure your system has the [suggested dependencies](https://github.com/rbenv/ruby-build/wiki#suggested-build-environment)
- Run `asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git`
- Consult the [plugin's page](https://github.com/asdf-vm/asdf-ruby) if you encounter any issues.

##### Run the app

- At the root of the project, run `asdf install`. Follow the output's instructions if an error occurs.
- At the root of the project, run `npm install`. Try again after deleting the node_modules folder if an error occurs.

##### iOS

- `cd ios && pod install`
- Then return to the root of the project with `cd ..` and run `npm run ios` or click Play in Xcode.

##### Android

- Run `npm start`
- Run `npm run android` in a separate terminal or hit Play in Android Studio.
- (M1 Mac) Run `adb reverse tcp:8081 tcp:8081` for the emulator to see the Metro server
- (Physical Android) Update your `.env` file to have `LOCAL_BASE_URL_ANDROID='http://localhost:4000/api/internal/v2.1/'`, then run `adb reverse tcp:4000 tcp:4000` for the emulator to see the Elixir server

##### Running Tests (Detox)

- Install [prerequiresites for Detox](https://wix.github.io/Detox/docs/introduction/getting-started/#1-command-line-tools-detox-cli).
- With ASDF, you may need to run `npm install detox` instead of installing it globally.

For Android, you'll need to create a simulator with the same name as specified in `.detoxrc.js`. At the time of writing this, it should be `Pixel 6 Pro API 29`. No additional setup is needed for iOS.

- Start the Phoenix server.
- Run `npm start`
- `npm run test:android-e2e-build` - As recommended by Detox, this creates a release version of an Android build that will run the tests, with the endpoints hitting localhost via `env.mock.ts`.
- `npm run test:android-e2e` - This will run everything in `__tests__/e2e/`. It will spin up an emulator and simulate user input as defined in each test.

Any changes to the app code will require running the build command again. If you've only changed the code in your test files, you can safely rerun the tests again.

To let Detox only run the tests in a certain file: `npx detox test --configuration android.sim.release __tests__/e2e/apply-to-drive.test.ts` replacing the file path to the one you're wishing to run tests for.
