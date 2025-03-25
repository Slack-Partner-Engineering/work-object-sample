// @ts-nocheck
import axios from 'axios';
import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

const MIRO_API_BASE_URL = "https://api.miro.com/v1";

const entityDetailsRequestedCallback = async ({
  client,
  event,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'entity_details_requested'>) => {
  try {

    console.log(event)

  } catch (error) {
    logger.error(error);
  }
};

export default entityDetailsRequestedCallback;
