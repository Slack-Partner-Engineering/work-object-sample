// handles link unfurling events sent from Slack to the app
import { link_shared } from "./link-shared";
import { entity_details_requested } from "./entity-details-requested"

export const event_handler = async (type, event, res, slackClient) => {
  res.status(200).send("Event received");

  if (event.type === "link_shared") {
    link_shared(type, event, res, slackClient);
  } else if (event.type === "entity_details_requested") {
    entity_details_requested(type, event, res, slackClient);
  } else {
    console.log(`Event not supported: ${event.type}`)
  }
};