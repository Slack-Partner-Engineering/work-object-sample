import axios from 'axios';

const SLACK_API_BASE_URL = "https://slack.com/api";

// https://api.slack.com/methods/entity.presentDetails
export const postEntityPresentDetails = async (
  trigger_id,
  metadata,
  user_auth_required = undefined,
  user_auth_url = undefined,
  error = undefined
) => {
  const entityPresentDetailsURL = `${SLACK_API_BASE_URL}/entity.presentDetails`;

  try {
    const response = await axios.post(
      entityPresentDetailsURL,
      {
        trigger_id: trigger_id,
        metadata: metadata,
        ...(user_auth_required !== undefined && { user_auth_required }),
        ...(user_auth_url !== undefined && { user_auth_url }),
        ...(error !== undefined && { error })
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error making a request to entity.presentDetails:\n', error);
    throw error;
  }
};