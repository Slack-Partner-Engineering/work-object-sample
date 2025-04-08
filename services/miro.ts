import axios from 'axios';

const MIRO_API_BASE_URL = "https://api.miro.com/v2";

// https://developers.miro.com/reference/get-specific-board
export const get_miro_board = async (boardId) => {
  const getMiroBoardUrl = `${MIRO_API_BASE_URL}/boards/${boardId}`;

  try {
    const response = await axios.get(getMiroBoardUrl, {
      headers: {
        Authorization: `Bearer ${process.env.MIRO_TOKEN}`,
        Accept: 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Miro board:', error.response);
    throw error;
  }
};