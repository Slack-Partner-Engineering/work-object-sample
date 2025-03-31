//Slack will check this when setting up the app initially in the app setup UI.
export const url_verify = async (type, challenge, event, res) => {
  res.json({ challenge });
  return;
};