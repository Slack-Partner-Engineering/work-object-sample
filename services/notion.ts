import axios from 'axios';

const NOTION_BASE_URL = "https://api.notion.com";

// https://developers.notion.com/reference/page
export const get_notion_page = async (page_id) => {
  const getNotionPageURL = `${NOTION_BASE_URL}/v1/pages/${page_id}`;

  try {
    const response = await axios.get(getNotionPageURL, {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        Accept: 'application/json',
        "Notion-Version": "2022-06-28"
      },

    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Notion page:', error.response);
    throw error;
  }
};