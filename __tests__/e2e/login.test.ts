import {by, device, expect, element} from 'detox';

describe('Login', () => {
  beforeEach(async () => {
    await device.launchApp({newInstance: true});
  });

  it('should take user to drive screen after submitting valid credentials', async () => {
    await element(by.id('LoginScreen.EmailInput')).typeText('user@frayt.com');
    await element(by.id('LoginScreen.PasswordInput')).typeText('password@1');

    const loginButton = await element(by.id('LoginScreen.LoginButton'));
    await loginButton.tap();

    await expect(element(by.id('DriveScreen.WelcomeText'))).toBeVisible();
  });

  it('should display error after submitting invalid credentials', async () => {
    await element(by.id('LoginScreen.EmailInput')).typeText('bogus');
    await element(by.id('LoginScreen.PasswordInput')).typeText('bogus');

    const loginButton = await element(by.id('LoginScreen.LoginButton'));
    await loginButton.tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should show first registration screen after tap', async () => {
    await element(by.id('LoginScreen.ApplyButton')).tap();
    await expect(element(by.id('InfoScreen.StartButton'))).toBeVisible();
  });
});
