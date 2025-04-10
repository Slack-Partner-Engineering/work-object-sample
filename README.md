# Work Objects Sample App

This sample app generates a Work Object unfurl when a Miro Board or GitHub Issue URL is posted in a Slack channel. Additionally, it provides data for the Work Objects flexpane when a user clicks an unfurl.

To learn more about implementing Work Objects in your Slack app, visit the [Work Object documentation page]().

### Miro File Work Object
![image](https://github.com/user-attachments/assets/fc742a19-29ad-43bc-a854-c0ac583a7b60)

### GitHub Task Work Object


## Installation & Setup

Before getting started, make sure you have a development workspace where you have permissions to install apps. If you don’t have one setup, go ahead and [create one](https://slack.com/create).

#### Create a Slack App

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose "From an app manifest"
2. Choose the workspace you want to install the application to
3. Copy the contents of [manifest.json](./manifest.json) into the text box that says `*Paste your manifest code here*` (within the JSON tab) and click _Next_
4. Review the configuration and click _Create_
5. Click _Install to Workspace_ and _Allow_ on the screen that follows. You'll then be redirected to the App Configuration dashboard.

#### Environment Variables

Before you can run the app, you'll need to store some environment variables. You are not required to setup both Miro **AND** GitHub - either is fine.

1. Copy `env.sample` to `.env`
2. Open your apps configuration page from [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the left hand menu, then copy the _Bot User OAuth Token_ into your `.env` file under `SLACK_BOT_TOKEN`

**Steps to setup Miro**
1. Create a Miro app by following the steps listed [here](https://developers.miro.com/docs/task-3-run-your-first-app-in-miro)
2. Install the app on Miro and copy the OAuth token that you receive to the `MIRO_TOKEN` variable in `.env`

**Steps to setup GitHub**
1. Create a GitHub Personal Access Token by following the steps listed [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)
2. Allow the Token to have read-only access to Issues and Pull Request. Click on create token
3. Copy the token to `GITHUB_TOKEN` in `.env`

#### Install Dependencies

`npm install`

#### Build Project

`npm run-script build`

#### Run Project

`npm start`

#### Testing Work Objects Unfurls in Slack

**Miro**
- Create a Miro board
- Copy the link and paste it in a Slack conversation
- Content should be unfurled into a File Work Object
- Click on the unfurl to open the flexpane

**GitHub**
- Create a GitHub repository
- Create an issue in that repository
- Copy the link to the issue and paste it in a Slack conversation
- Content should be unfurled into a Task Work Object
- Click on the unfurl to open the flexpane

## Project Structure

### `manifest.json`

`manifest.json` is a configuration for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

### `server.ts`

`server.ts` is the entry point for the application and the setup of the Slack Client.

### `/events`

Every incoming request is sent to `event-handler.ts`, which routes every incoming request to the appropriate event handler.

### `/services`

Contains functions that perform outgoing API requests to third party services

### `/utils`

Contains helper functions

## App Distribution / OAuth
Slack requires a public URL where it can send requests. In this template app, we've used [`ngrok`](https://ngrok.com/download). Checkout [this guide](https://ngrok.com/docs#getting-started-expose) for setting it up.

Start `ngrok` to access the app on an external network and create a redirect URL for OAuth.

```
ngrok http 3000
```

This output should include a forwarding address for `http` and `https` (we'll use `https`). It should look something like the following:

```
Forwarding   https://3cb89939.ngrok.io -> http://localhost:3000
```

Navigate to **OAuth & Permissions** in your app configuration and click **Add a Redirect URL**. The redirect URL should be set to your `ngrok` forwarding address with the `slack/oauth_redirect` path appended. For example:

```
https://3cb89939.ngrok.io/slack/oauth_redirect
```