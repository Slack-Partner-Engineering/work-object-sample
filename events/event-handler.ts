//Handles the different events sent from Slack to the app.
//This entire file can likely be replaced when bolt is ready, it's really just a patched version as features came out that
//needed to be handled. Not the cleanest logic or the most readable at this point.
import { not_supported } from "./not-supported";
import { link_shared } from "./link-shared";
import { entity_details_requested } from "./entity-details-requested"

export const event_handler = async (
  type,
  event,
  res,
  slackClient
) => {
  res.status(200).send("Event received");
  console.log(event);
  if (
    type === "event_callback" &&
    typeof event.bot_profile === "undefined" &&
    typeof event.files === "undefined"
  ) {
    if (event.type === "link_shared") {
      link_shared(type, event, res, slackClient);
    } else if (event.type === "entity_details_requested") {
      entity_details_requested(type, event, res, slackClient);
    } else if (event.type === "app_home_opened") {

    }
  } else {
    not_supported(type, event, res, slackClient);
  }
};