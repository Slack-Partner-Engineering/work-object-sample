import { get_miro_board } from '../services/miro'
import { convert_datetime_to_timestamp } from '../utils/time'
import { extract_miro_board_id } from '../utils/miro'

export const link_shared = async (type, event, res, slackClient) => {
  try {
    const link = event.links[0];
    const boardId = extract_miro_board_id(link.url);

    if (boardId) {
      const miroBoard = await get_miro_board(boardId);

      const metadata = {
        entities: [
          {
            entity_type: 'slack#/entities/file',
            app_unfurl_url: link.url,
            entity_payload: {
              attributes: {
                url: link.url,
                unique_identifier: boardId,
                title: {
                  text: miroBoard.name,
                },
                display_type: `Miro ${miroBoard.type}`,
                product_name: "Miro"
              },
              fields: {
                preview: {
                  alt_text: 'Miro Board image',
                  image_url: miroBoard.picture.imageUrl
                },
              },
              custom_fields: [ 
                {
                    key: "starred", 
                    label: "Starred",
                    value: "Yes",
                    type: "string"
                }
              ],
              display_order: ["starred", "preview"]
            },
          }
        ]
      };

      await slackClient.chat.unfurl({
          channel: event.channel,
          ts: event.message_ts,
          unfurls: {},
          metadata: metadata
        });
    } else {
      console.log('No board ID detected. Do not unfurl')
    }
  } catch (error) {
    console.error(error);
  }
};