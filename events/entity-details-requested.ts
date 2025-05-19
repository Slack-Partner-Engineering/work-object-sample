import { get_miro_board } from '../services/miro'
import { get_github_issue } from '../services/github'
import { get_pagerduty_incident } from '../services/pagerduty'
import { get_notion_page } from '../services/notion'
import { post_entity_present_details } from '../services/slack'
import { convert_datetime_to_timestamp } from '../utils/time'
import { extract_github_owner_from_url, extract_github_repo_from_url } from '../utils/github'

export const entity_details_requested = async (event, slackClient) => {
  try {
    let metadata;
    const link = event.link;

    if (link.domain.includes("github.com")) {
      const owner = extract_github_owner_from_url(link.url);
      const repo = extract_github_repo_from_url(link.url);
      const issueId = event.external_ref.id // we set this external reference ID previously in `link_shared.ts`

      const issue = await get_github_issue(owner, repo, issueId);
      metadata = createGitHubIssueTaskEntityFlexpane(event, issue);

    } else if (link.domain.includes("miro.com")) {
      const boardId = event.external_ref.id // we set this external reference ID previously in `link_shared.ts`

      const board = await get_miro_board(boardId);
      metadata = createMiroBoardFileEntityFlexpane(event, board);

    } else if (link.domain.includes("pagerduty.com")) {
      const incidentId = event.external_ref.id // we set this external reference ID previously in `link_shared.ts`

      const incident = await get_pagerduty_incident(incidentId);
      metadata = createPagerDutyIncidentEntityFlexpane(event, incident.incident);

    } else if (link.domain.includes("notion.so")) {
      const pageId = event.external_ref.id // we set this external reference ID previously in `link_shared.ts`

      const page = await get_notion_page(pageId);
      metadata = createNotionContentItemEntityFlexpane(event, page);
      console.log(metadata)
      console.log(metadata.entity_payload)
    } else {
      throw(`Unrecognized Work Object unfurl:\n ${event}`);
    }

    // (optional) if authenticated is necessary to view flexpane content, then verify if user is authenticated
    const userIsAuthenticated = validateUserAuth(event.user);

    if (userIsAuthenticated) {
      // (optional) user is authenticated, but let's verify if they have access to the resource
      const userHasAccess = validateUserAccess(event.user);

      if (!userHasAccess) {
        // denies access to flexpane with restricted error (i.e. 403 error code)
        const error = {
          status: "restricted"
        }

        // (optional) set your own custom error message
        // const error = {
        //   status: "custom",
        //   custom_message: "User does not have access to the repository"
        // }

        await slackClient.entity.presentDetails({
          trigger_id: event.trigger_id,
          error: error
        });
      }

      // user is authenticated and has access to the resource
      // display flexpane
      await slackClient.entity.presentDetails({
        trigger_id: event.trigger_id,
        metadata: metadata
      });

      // post_entity_present_details(event.trigger_id, metadata) // direct API call
    } else {
      // deny access to flexpane because user is not authenticated
      const user_auth_url = 'https://github.com/login' // put your OAuth authentication url here
      await slackClient.entity.presentDetails({
        trigger_id: event.trigger_id,
        user_auth_required: true,
        user_auth_url: user_auth_url
      });
    }

  } catch (error) {
    console.error("Error handling entity_details_requested:\n", error);
  }
};

function validateUserAuth(user_id) : boolean {
  // your logic here to validate if user is authenticated
  // returns true if user is authenticated
  return true;
}

function validateUserAccess(user_id): boolean {
  // your logic here to validate if user has access to the resource
  // returns true if user has access
  return true;
}

function createMiroBoardFileEntityFlexpane(event, board) {
  return {
    entity_type: 'slack#/entities/file',
    entity_payload: {
      attributes: {
        url: "",
        external_ref: event.external_ref,
        title: {
          text: board.name,
        },
        display_type: `Miro ${board.type}`,
        product_name: "Miro"
      },
      fields: {
        created_by: {
          value: board.createdBy.name,
          type: 'string'
        },
        preview: {
          alt_text: 'Miro Board image',
          image_url: board.picture.imageURL
        },
        last_modified_by: {
          value: board.modifiedBy.name,
          type: 'string'
        },
        date_created: {
          value: convert_datetime_to_timestamp(board.createdAt),
        },
        date_updated: {
          value: convert_datetime_to_timestamp(board.modifiedAt),
        },
        file_size: {
          value: "NA"
        },
        mime_type: {
          value: "Miro"
        }
      },
      display_order: ["preview", "created_by", "last_modified_by", "date_created", "date_updated", "file_size", "mime_type"]
    }
  };
}

function createGitHubIssueTaskEntityFlexpane(event, issue) {
  return {
    entity_type: 'slack#/entities/task',
    entity_payload: {
      attributes: {
        url: issue.url,
        external_ref: event.external_ref,
        title: {
          text: issue.title,
        },
        display_type: `Issue`,
        product_name: "GitHub"
      },
      fields: {
        description: {
          value: issue.body,
          format: "markdown"
        },
        created_by: {
          value: issue.user.login,
          type: "string"
        },
        date_created: {
          value: convert_datetime_to_timestamp(issue.created_at)
        },
        date_updated: {
          value: convert_datetime_to_timestamp(issue.updated_at)
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
      display_order: ["description", "status", "assignee", "milestone", "created_by", "date_created", "date_updated"]
    },
  }
};

function createPagerDutyIncidentEntityFlexpane(event, incident) {
  return {
    entity_type: 'slack#/entities/incident',
    entity_payload: {
      attributes: {
        url: event.link.url,
        external_ref: event.external_ref,
        title: {
          text: incident.summary,
        },
        display_type: `Incident`,
        product_name: "PagerDuty"
      },
      fields: {
        created_by: {
          value: "U06H37B22MQ", // add a valid Slack user ID here
          type: "slack#/types/user_id" 
        },
        assigned_to: {
          value: incident.assignments[0].assignee.summary ? incident.assignments[0].assignee.summary : "None", // takes the first user
          type: "string"
        },
        date_created: {
          value: convert_datetime_to_timestamp(incident.created_at)
        },
        date_updated: {
          value: convert_datetime_to_timestamp(incident.updated_at)
        },
        description: {
          value: incident.summary,
          type: "string"
        },
        status: {
          value: incident.status
        },
        severity: {
          value: incident.urgency
        },
        service: {
          value: incident.service.summary
        }
      },
      custom_fields: [ 
        {
          key: "priority", 
          label: "Priority",
          value: incident.priority.summary,
          type: "string"
        }
      ],
      display_order: ["status", "severity", "priority", "description", "service", "assigned_to", "created_by", "date_created", "date_updated"]
    },
  }
};

function createNotionContentItemEntityFlexpane(event, page) {
  return {
    entity_type: 'slack#/entities/content_item',
    entity_payload: {
      attributes: {
        url: event.link.url,
        external_ref: event.external_ref,
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
        description: {
          value: "Description of Notion page",
          format: "markdown"
        },
        date_created: {
          value: convert_datetime_to_timestamp(page.created_time)
        },
        date_updated: {
          value: convert_datetime_to_timestamp(page.last_edited_time)
        },
        last_modified_by: {
          value: "U06H37B22MQ", // add a valid Slack user ID here
          type: "slack#/types/user_id" 
        },
        created_by: {
          value: "U06H37B22MQ", // add a valid Slack user ID here
          type: "slack#/types/user_id" 
        }
      },
      display_order: ["preview", "description", "date_created", "date_updated", "last_modified_by", "created_by"]
    },
  }
}