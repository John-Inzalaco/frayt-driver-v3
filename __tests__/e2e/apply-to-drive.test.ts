import {by, device, expect, element} from 'detox';

describe('Apply To Drive', () => {
  const navigateToApplyToDrive = async () => {
    await element(by.id('LoginScreen.ApplyButton')).tap();
  };

  beforeEach(async () => {
    await device.launchApp({
      delete: true
    });
    await navigateToApplyToDrive();
  });

  it('Questionnaire and Create Account take you to Personal Screen with valid inputs', async () => {
    await element(by.id("InfoScreen.BackButton")).tap();

    // LOGIN SCREEN
    await element(by.id('LoginScreen.ApplyButton')).tap();

    // INFO SCREEN
    await element(by.id('InfoScreen.StartButton')).tap();

    // QUESTIONNAIRE SCREEN
    await element(by.text('Select your state ')).tap();
    await element(by.text('OH')).tap();
    await element(by.text('Select your market ')).tap();
    await element(by.text('Cincinnati, OH')).tap();
    await element(by.text('English Proficiency ')).tap();
    await element(by.id('QuestionnaireScreen.ProficiencyItem')).tap();
    const emailInput = await element(by.id('QuestionnaireScreen.EmailInput'));
    await emailInput.tap();
    await emailInput.typeText(`test_${Math.floor(Math.random() * 100000)}@frayt.com`);
    await emailInput.tapReturnKey();
    const phoneNumber = await element(by.text('+1'));
    await phoneNumber.tap();
    await phoneNumber.typeText('5138411001\n');
    await element(by.id('QuestionnaireScreen.SubmitButton')).tap();

    // CREATE ACCOUNT
    await expect(element(by.id('CreateAccount.HeaderText'))).toBeVisible();
    const passwordInput = await element(by.id('CreateAccount.PasswordInput'));
    await passwordInput.tap();
    await passwordInput.typeText('password@1');
    await passwordInput.tapReturnKey();
    const passwordConfirmationInput = await element(by.id('CreateAccount.PasswordConfirmationInput'));
    await passwordConfirmationInput.tap();
    await passwordConfirmationInput.typeText('password@1');
    await passwordConfirmationInput.tapReturnKey();
    await element(by.id('CreateAccount.AgreementCheckbox_0')).tap();
    await element(by.id('CreateAccount.ScrollView')).swipe('down', 'slow', 0.5, 0.5, 0.6);
    await element(by.id('CreateAccount.SubmitButton')).tap();
  });

  it("Personal screen takes you to Verify Identity screen with valid credentials", async () => {
        // INFO
        await element(by.id('InfoScreen.StartButton')).tap();
        // QUESTIONNAIRE
        await element(by.id('ApplyToDriverFooter.NextButton')).tap();
        // CREATE ACCOUNT
        await element(by.id('ApplyToDriverFooter.NextButton')).tap();
        
        // PERSONAL
        const firstNameInput = await element(by.id('PersonalScreen.FirstNameInput'));
        await firstNameInput.tap();
        await firstNameInput.typeText('Some');
        await firstNameInput.tapReturnKey();
        const lastNameInput = await element(by.id('PersonalScreen.LastNameInput'));
        await lastNameInput.tap();
        await lastNameInput.typeText(`Name ${Math.floor(Math.random() * 100000)}`);
        await lastNameInput.tapReturnKey();
        const dobPicker = await element(by.id('PersonalScreen.DatePicker'));
        await dobPicker.tap();
        await dobPicker.tap({x: 10, y: 10});
        const addressInput = await element(by.id('PersonalScreen.AddressInput'));
        await addressInput.tap();
        await addressInput.typeText('1311 Vine St');
        await addressInput.tapReturnKey();
        const cityInput = await element(by.id('PersonalScreen.CityInput'));
        await element(by.id('PersonalScreen.ScrollView')).swipe('up', 'slow', 0.5, 0.5, 0.1);
        await cityInput.tap();
        await cityInput.typeText('Cincinnati');
        await cityInput.tapReturnKey();
        const stateInput = await element(by.id('PersonalScreen.StateInput'));
        await stateInput.tap();
        await stateInput.typeText('OH');
        await stateInput.tapReturnKey();
        const zipInput = await element(by.id('PersonalScreen.ZipInput'));
        await zipInput.tap();
        await zipInput.typeText('45202');
        await zipInput.tapReturnKey();
        await element(by.id('PersonalScreen.ScrollView')).swipe('up', 'slow', 0.5, 0.5, 0.1);
        await element(by.id('PersonalScreen.SubmitButton')).tap();
        await expect(element(by.id('VerifyScreen.LicenseInput'))).toBeVisible();
  })

  it("Verify screen takes you to Payouts screen with valid data", async () => {
    // INFO
    await element(by.id('InfoScreen.StartButton')).tap();
    // QUESTIONNAIRE
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // CREATE ACCOUNT
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // PERSONAL
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();

    // VERIFY
    const licenseInput = await element(by.id('VerifyScreen.LicenseInput'));
    await licenseInput.tap();
    await licenseInput.typeText('Some');
    await licenseInput.tapReturnKey();
    await element(by.id('VerifyScreen.LicensePhotoInput')).tap();
    const licenseExpirationInput = await element(by.id('VerifyScreen.LicenseExpirationInput'));
    await licenseExpirationInput.tap();
    await licenseExpirationInput.tap({x: 10, y: 10});
    const ssnInput = await element(by.id('VerifyScreen.SsnInput'));
    await ssnInput.tap();
    await ssnInput.typeText('111111111');
    await ssnInput.tapReturnKey();
    await element(by.id('VerifyScreen.ProfilePhotoInput')).tap();
    await element(by.id('VerifyScreen.SubmitButton')).tap();
    await expect(element(by.text('Payouts'))).toBeVisible();
  });

  it("Vehicle screen takes you to Vehicle Photos screen with valid credentials", async () => {
    // INFO
    await element(by.id('InfoScreen.StartButton')).tap();
    // QUESTIONNAIRE
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // CREATE ACCOUNT
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // PERSONAL
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // VERIFY
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // PAYOUTS
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();

    // Vehicle
    const makeInput = await element(by.id('VehicleScreen.MakeInput'));
    await makeInput.tap();
    await makeInput.typeText('Some');
    await makeInput.tapReturnKey();
    const modelnput = await element(by.id('VehicleScreen.ModelInput'));
    await modelnput.tap();
    await modelnput.typeText('Model');
    await modelnput.tapReturnKey();
    const licensePlatInput = await element(by.id('VehicleScreen.LicensePlateInput'));
    await licensePlatInput.tap();
    await licensePlatInput.typeText('Something');
    await licensePlatInput.tapReturnKey();
    const vinInput = await element(by.id('VehicleScreen.VinInput'));
    await vinInput.tap();
    await vinInput.typeText('Something');
    await vinInput.tapReturnKey();
    await element(by.text('Select your vehicle type... ')).tap();
    await element(by.id('VehicleScreen.VehicleClassItem')).tap();
    await element(by.id('VehicleScreen.InsurancePhotoInput')).tap();
    await element(by.id('VehicleScreen.RegistrationPhotoInput')).tap();
    await element(by.id('VehicleScreen.ScrollView')).swipe('up', 'slow', 0.5, 0.5, 0.1);
    const insuranceExpirationInput = await element(by.id('VehicleScreen.InsuranceExpirationInput'));
    await insuranceExpirationInput.tap();
    await insuranceExpirationInput.tap({x: 10, y: 10});
    const registrationExpirationInput = await element(by.id('VehicleScreen.RegistrationExpirationInput'));
    await registrationExpirationInput.tap();
    await registrationExpirationInput.tap({x: 10, y: 10});
    await element(by.id('VehicleScreen.SubmitButton')).tap();
    await expect(element(by.text('Vehicle Photos'))).toBeVisible();
  });

  it("Verify screen takes you to Payouts screen with valid credentials", async () => {
    // INFO
    await element(by.id('InfoScreen.StartButton')).tap();
    // QUESTIONNAIRE
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // CREATE ACCOUNT
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // PERSONAL
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // VERIFY
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // PAYOUTS
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();
    // Vehicle
    await element(by.id('ApplyToDriverFooter.NextButton')).tap();

    // VEHICLE PHOTOS
    await element(by.id('VehiclePhotosScreen.FrontPhoto')).tap();
    await element(by.id('VehiclePhotosScreen.BackPhoto')).tap();
    await element(by.id('VehiclePhotosScreen.DriverSidePhoto')).tap();
    await element(by.id('VehiclePhotosScreen.PassengerSidePhoto')).tap();
    await element(by.id('VehiclePhotosScreen.CargoPhoto')).tap();
    await element(by.id('VehiclePhotosScreen.SubmitButton')).tap();
    await expect(element(by.text('Background Check'))).toBeVisible();
  });

});
