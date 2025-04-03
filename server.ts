import express from "express";
import bodyParser from "body-parser";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { event_handler } from "./events/event-handler";
import { url_verify } from "./events/url-verify";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const slackToken = process.env.SLACK_BOT_TOKEN;
const slackClient = new WebClient(slackToken);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Running...");
});

app.post("/slack/events", async (req, res) => {
  const { type, challenge, event } = req.body;

  type === "url_verification"
    ? url_verify(type, challenge, event, res)
    : event_handler(type, event, res, slackClient);
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});