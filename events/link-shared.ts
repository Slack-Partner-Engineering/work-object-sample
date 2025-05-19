import { get_miro_board } from '../services/miro'
import { get_github_issue } from '../services/github'
import { get_pagerduty_incident } from '../services/pagerduty'
import { get_notion_page } from '../services/notion'
import { is_pagerduty_url, extract_pagerduty_incident_from_url } from '../utils/pagerduty'
import { is_notion_url, extract_notion_page_from_url } from '../utils/notion'
import { is_miro_url, extract_miro_board_id_from_url } from '../utils/miro'
import { is_github_url, extract_github_issue_id_from_url, extract_github_owner_from_url, extract_github_repo_from_url } from '../utils/github'
import { convert_datetime_to_timestamp } from '../utils/time'

export const link_shared = async (event, slackClient) => {
  try {
    const link = event.links[0]; // only unfurl the first link shared
    let metadata;

    if (is_github_url(link.url)) {
      // only unfurls URLs that belong to a GitHub Cloud Issue e.g. http://github.com/org-name/repo-name/issues/123/
      const issueId = extract_github_issue_id_from_url(link.url);

      if (issueId) {
        const owner = extract_github_owner_from_url(link.url);
        const repo = extract_github_repo_from_url(link.url);

        const issue = await get_github_issue(owner, repo, issueId);
        metadata = createGitHubIssueTaskEntityUnfurl(link, issue);

      } else {
        console.log(`GitHub URL is not an Issue. Cannot unfurl URL: ${link.url}`);
      }

    } else if (is_miro_url(link.url)) {
      // only unfurls URLs that belong to a miro board e.g. https://miro.com/app/board/XYZ=/
      const boardId = extract_miro_board_id_from_url(link.url);

      if (boardId) {
        const board = await get_miro_board(boardId);
        metadata = createMiroBoardFileEntityUnfurl(link, board);

      } else {
        console.log(`Miro URL is not a board. Cannot unfurl URL: ${link.url}`);
      }

    } else if (is_pagerduty_url(link.url)) {
      // only unfurls URLs that belong to a PagerDuty incident e.g. https://pagerduty.com/incidents/123ABC/
      const incidentId = extract_pagerduty_incident_from_url(link.url);

      if (incidentId) {
        const incident = await get_pagerduty_incident(incidentId)

        metadata = createPagerDutyIncidentEntityUnfurl(link, incident.incident)

      } else {
        console.log(`PagerDuty URL is not an incident. Cannot unfurl URL: ${link.url}`);
      }
  
    } else if (is_notion_url(link.url)) {
      // only unfurls URLs that belong to a Notion page e.g. https://www.notion.so/{user}/Getting-Started-abc123
      const pageId = extract_notion_page_from_url(link.url);

      if (pageId) {
        const page = await get_notion_page(pageId)

        metadata = createNotionContentItemEntityUnfurl(link, page)

      } else {
        console.log(`Notion URL is not a page. Cannot unfurl URL: ${link.url}`);
      }
  
    } else {
      throw(`URL cannot be unfurled: ${link.url}`);
    }  

    await slackClient.chat.unfurl({
        channel: event.channel,
        ts: event.message_ts,
        unfurls: {}, // send your existing unfurl here
        metadata: metadata
      });
  } catch (error) {
    console.error("Error handling link_shared:\n", error);
  }
};

function createMiroBoardFileEntityUnfurl(link, board) {
  return {
    entities: [
      {
        app_unfurl_url: link.url,
        entity_type: 'slack#/entities/file',
        entity_payload: {
          attributes: {
            url: link.url,
            external_ref: {
              id: `${board.id}`
            },
            title: {
              text: board.name,
            },
            display_type: `Miro ${board.type}`,
            product_name: "Miro"
          },
          fields: {
            preview: {
              alt_text: 'Miro Board image',
              image_url: board.picture.imageURL
            },
          },
          custom_fields: [ 
            {
                key: "starred", 
                label: "Starred",
                value: "Yes",
                type: "string"
            }
          ],
          display_order: ["starred", "preview"]
        },
      }
    ]
  };
}

function createGitHubIssueTaskEntityUnfurl(link, issue) {
  return {
    entities: [
      {
        app_unfurl_url: link.url,
        entity_type: 'slack#/entities/task',
        entity_payload: {
          attributes: {
            url: link.url,
            external_ref: {
              id: `${issue.number}`
            },
            title: {
              text: issue.title,
            },
            display_type: `Issue`,
            product_name: "GitHub"
          },
          fields: {
            date_created: {
              value: convert_datetime_to_timestamp(issue.created_at)
            },
            assignee: {
              value: issue.assignee ? issue.assignee.login : "None",
              type: "string" 
            },
            status: {
              value: issue.state
            },
          },
          custom_fields: [ 
            {
                key: "milestone", 
                label: "Milestone",
                value: issue.milestone ? issue.milestone.title : "None",
                type: "string"
            }
          ],
          display_order: ["status", "assignee", "milestone", "date_created"]
        },
      }
    ]
  };
}

function createPagerDutyIncidentEntityUnfurl(link, incident) {
  return {
    entities: [
      {
        app_unfurl_url: link.url,
        entity_type: 'slack#/entities/incident',
        entity_payload: {
          attributes: {
            url: link.url,
            external_ref: {
              id: `${incident.id}`
            },
            title: {
              text: incident.title,
            },
            display_type: `Incident`,
            product_name: "PagerDuty"
          },
          fields: {
            date_created: {
              value: convert_datetime_to_timestamp(incident.created_at)
            },
            severity: {
              value: incident.urgency,
              tag_color: "red"
            },
            status: {
              value: incident.status
            },
          },
          custom_fields: [ 
            {
                key: "priority", 
                label: "Priority",
                value: incident.priority.summary,
                type: "string"
            }
          ],
          display_order: ["status", "severity", "priority", "date_created"]
        },
      }
    ]
  };
}

function createNotionContentItemEntityUnfurl(link, page) {
  return {
    entities: [
      {
        app_unfurl_url: link.url,
        entity_type: 'slack#/entities/content_item',
        entity_payload: {
          attributes: {
            url: link.url,
            external_ref: {
              id: `${page.id}`
            },
            title: {
              text: page.properties.title.title[0].text.content,
            },
            display_type: `Page`,
            product_name: "Notion"
          },
          fields: {
            preview: {
              alt_text: 'Notion Page Preview',
              image_url: page.cover.external.url
            },
            created_by: {
              value: "U06H37B22MQ", // add a valid Slack user ID here
              type: "slack#/types/user_id" 
            },
            date_created: {
              value: convert_datetime_to_timestamp(page.created_time)
            }
          },
          display_order: ["preview", "created_by", "date_created"]
        },
      }
    ]
  };
}