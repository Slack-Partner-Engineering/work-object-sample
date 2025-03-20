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

      const encodedMetadata = urlEncodeMetadata({
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
                header_key: "Miro File",
                subtitle: {
                  text: response.data.type,
                }
              },
              fields: {
                created_by: {
                  value: response.data.createdBy.name,
                  type: 'string'
                },
                preview: {
                  type: 'image',
                  alt_text: 'Miro Board image',
                  image_url: response.data.picture.imageUrl
                }
              }
            }
          }
        ]
      });

      await client.chat.unfurl({
          channel: event.channel,
          ts: event.message_ts,
          unfurls: {},
          metadata: encodedMetadata
        });
    }
  } catch (error) {
    logger.error(error);
  }
};

function extractMiroBoardId(url: string): string | null {
  const regex = /miro\.com\/app\/board\/(\w+=?)\//;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function urlEncodeMetadata(metadata: object) : string {
  return encodeURIComponent(JSON.stringify(metadata));
}

export default linkSharedCallback;
