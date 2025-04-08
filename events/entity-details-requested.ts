import { get_miro_board } from '../services/miro'
import { convert_datetime_to_timestamp } from '../utils/time'
import { postEntityPresentDetails } from '../services/slack'

export const entity_details_requested = async (type, event, res, slackClient) => {
  try {
    const miroBoard = await get_miro_board(event.external_ref.id);

    const metadata = {
      entity_type: 'slack#/entities/file',
      entity_payload: {
        attributes: {
          url: event.link,
          external_ref: event.external_ref,
          title: {
            text: miroBoard.name,
          },
          display_type: `Miro ${miroBoard.type}`,
          product_name: "Miro"
        },
        fields: {
          created_by: {
            value: miroBoard.createdBy.name,
            type: 'string'
          },
          preview: {
            alt_text: 'Miro Board image',
            image_url: miroBoard.picture.imageURL
          },
          last_modified_by: {
            value: miroBoard.modifiedBy.name,
            type: 'string'
          },
          date_created: {
            value: convert_datetime_to_timestamp(miroBoard.createdAt),
          },
          date_updated: {
            value: convert_datetime_to_timestamp(miroBoard.modifiedAt),
          },
          file_size: {
            value: "NA"
          },
          mime_type: {
            value: "Miro"
          }
        },
        display_order: ["preview", "created_by", "last_modified_by", "date_created", "date_updated", "file_size", "mime_type"]
      }
    };

    // (optional) if auth is implemented for flexpane, then verify if user is authed
    const verifyUserIsAuthed = validateUserAuth(event.user);
    if (verifyUserIsAuthed) { // if authenticated, proceed as usual
      await postEntityPresentDetails(event.trigger_id, metadata, false)
    } else { // else, send notify users that they must authenticated in order to view flexpane
      await postEntityPresentDetails(event.trigger_id, metadata, true)
    }

  } catch (error) {
    console.error("Error handling entity_details_requested:\n", error);
  }
};

function validateUserAuth(user_id) : boolean {
  // your logic here to validate if user is authenticated
  return true;
}
