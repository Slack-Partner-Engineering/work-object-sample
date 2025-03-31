//Message used when the interaction is not supported. In the sample media is not supported.
export const not_supported = async (type, event, res, slackClient) => {
  if (typeof event.bot_profile != "undefined") {
    return;
  }
  try {
    await slackClient.chat.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts || event.ts,
      text: `:cry: I am sorry but this type of message is not supported. I am just here for testing.`,
    });
  } catch (error) {
    console.error(error);
  }
};