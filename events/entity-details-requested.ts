import axios from 'axios';
import { get_miro_board } from '../services/miro'
import { convert_datetime_to_timestamp } from '../utils/time'

export const entity_details_requested = async (type, event, res, slackClient,) => {
  try {
    const miroBoard = await get_miro_board(event.object_id);

    const metadata = {
      entity_type: 'slack#/entities/file',
      entity_payload: {
        attributes: {
          url: event.link,
          unique_identifier: event.object_id,
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
            image_url: miroBoard.picture.imageUrl
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
        display_order: ["created_by", "last_modified_by", "date_created", "date_updated", "file_size", "mime_type", "preview"]
      }
    };

    await axios.post(
      'https://slack.com/api/entity.presentDetails',
      {
        user: event.user,
        source_id: event.object_id,
        user_auth_required: false,
        metadata: metadata
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};
