import type { App } from '@slack/bolt';
import appHomeOpenedCallback from './app-home-opened';
import linkSharedCallback from './link-shared';
import entityDetailsRequestedCallback from './entity_details_requested';


const register = (app: App) => {
  app.event('app_home_opened', appHomeOpenedCallback);
  app.event('link_shared', linkSharedCallback);
  // @ts-ignore
  app.event('entity_details_requested', entityDetailsRequestedCallback);
};

export default { register };
