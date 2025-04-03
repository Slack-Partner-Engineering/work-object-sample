// Slack will verify the Events URL set for a Slack app
export const url_verify = async (type, challenge, event, res) => {
  res.json({ challenge });
  return;
};