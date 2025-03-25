// @ts-nocheck
import axios from 'axios';
import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

const MIRO_API_BASE_URL = "https://api.miro.com/v1";

const linkSharedCallback = async ({
  client,
  event,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'link_shared'>) => {
  try {

    console.log(event.links)

    const link = event.links[0];
    const boardId = extractMiroBoardId(link.url);

    if (boardId) {
      const miroFetchBoardUrl = `${MIRO_API_BASE_URL}/boards/${boardId}`;

      const response = await axios.get(miroFetchBoardUrl, {
        headers: {
          Authorization: `Bearer ${process.env.MIRO_TOKEN}`,
          Accept: 'application/json'
        }
      });

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
                  text: response.data.name,
                },
                display_type: "Miro File",
                product_name: `Miro ${response.data.type}`
              },
              fields: {
                created_by: {
                  value: response.data.createdBy.name,
                  type: 'string'
                },
                preview: {
                  alt_text: 'Miro Board image',
                  image_url: response.data.picture.imageUrl
                },
                last_modified_by: {
                  value: response.data.modifiedBy.name,
                  type: 'string'
                },
                date_created: {
                  value: convertDateTimeToTimestamp(response.data.createdAt),
                },
                date_updated: {
                  value: convertDateTimeToTimestamp(response.data.modifiedAt),
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
          }
        ]
      };

      await client.chat.unfurl({
          channel: event.channel,
          ts: event.message_ts,
          unfurls: {},
          metadata: metadata
        });
    }
  } catch (error) {
    logger.error(error);
  }
};

function convertDateTimeToTimestamp(time: string): string {
  return new Date(time).getTime() / 1000;
}

function extractMiroBoardId(url: string): string | null {
  const regex = /miro\.com\/app\/board\/(\w+=?)\//;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function urlEncodeMetadata(metadata: object) : string {
  return encodeURIComponent(JSON.stringify(metadata));
}

export default linkSharedCallback;
