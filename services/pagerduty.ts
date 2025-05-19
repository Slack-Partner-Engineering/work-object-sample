import axios from 'axios';

const PAGERDUTY_BASE_URL = "https://api.pagerduty.com";

// https://developer.pagerduty.com/api-reference/005299ed43553-get-an-incident
export const get_pagerduty_incident = async (incident_id) => {
  const getIncidentURL = `${PAGERDUTY_BASE_URL}/incidents/${incident_id}`;

  try {
    const response = await axios.get(getIncidentURL, {
      headers: {
        Authorization: `Token token=${process.env.PAGERDUTY_TOKEN}`,
        "Content-Type": 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching PagerDuty incident:', error.response);
    throw error;
  }
};