import clc from 'cli-color';
import commander from 'commander';
import { checkForUpdate } from '../checkForUpdate';
import { errorAndExit } from '../errorAndExit';
import { getAlks, Props as AlksProps } from '../getAlks';
import { getDeveloper } from '../getDeveloper';
import { getPasswordFromPrompt } from '../getPasswordFromPrompt';
import { log } from '../log';
import { passwordSaveErrorHandler } from '../passwordSaveErrorHandler';
import { storeToken } from '../storeToken';
import { trackActivity } from '../trackActivity';
import open from 'open';

export async function handleAlksDeveloperLogin2fa(
  _options: commander.OptionValues,
  _program: commander.Command
) {
  try {
    log('loading developer');
    const data = await getDeveloper();

    console.error('Opening ALKS 2FA Page.. Be sure to login using Okta..');
    const url = data.server.replace(/rest/, 'token-management');
    try {
      await Promise.race([
        open(url, {
          newInstance: true,
        }),
        new Promise((_, rej) => {
          setTimeout(() => rej(), 5000);
        }), // timeout after 5 seconds
      ]);
    } catch (err) {
      console.error(`Failed to open ${url}`);
      console.error('Please open the url in the browser of your choice');
    }

    console.error('Please copy your refresh token from ALKS and paste below..');

    const refreshToken = await getPasswordFromPrompt('Refresh Token');
    log('exchanging refresh token for access token');

    const alks = await getAlks({
      baseUrl: data.server,
    } as AlksProps);

    try {
      await alks.getAccessToken({
        refreshToken,
      });
    } catch (err) {
      errorAndExit('Error validating refresh token. ' + err.message);
    }

    console.error(clc.white('Refresh token validated!'));
    try {
      await storeToken(refreshToken);
      console.error(clc.white('Refresh token saved!'));
    } catch (err) {
      log('error saving token! ' + err.message);
      passwordSaveErrorHandler(err);
    }

    log('checking for updates');
    await checkForUpdate();
    await trackActivity();

    setTimeout(() => {
      process.exit(0);
    }, 1000); // needed for if browser is still open
  } catch (err) {
    errorAndExit(err.message, err);
  }
}