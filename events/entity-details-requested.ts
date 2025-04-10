import { get_miro_board } from '../services/miro'
import { get_github_issue } from '../services/github'
import { convert_datetime_to_timestamp } from '../utils/time'
import { postEntityPresentDetails } from '../services/slack'

export const entity_details_requested = async (event, slackClient) => {
  try {
    const externalRefId = event.external_ref.id; // we set this external reference ID previously in `link_shared.ts`
    let metadata;

    if (externalRefId.startsWith('github_issue')) {
      const idParts = externalRefId.split('_') // ID is formatted as `github_issue_{owner}_{repo}_{issue.number}`
      const owner = idParts[2];
      const repo = idParts[3];
      const issueId = idParts[4];

      const issue = await get_github_issue(owner, repo, issueId);
      metadata = createGitHubIssueTaskEntityFlexpane(event, issue);

    } else if (externalRefId.startsWith('miro_board')) {
      const boardId = externalRefId.split('_')[2]; // ID is formatted as `miro_board_{board.id}`

      const board = await get_miro_board(boardId);
      metadata = createMiroBoardFileEntityFlexpane(event, board);

    } else {
      throw("Cannot recognize external reference id");
    }

    // (optional) if auth is implemented for flexpane, then verify if user is authed
    const userIsAuthenticated = validateUserAuth(event.user);

    if (userIsAuthenticated) {
      await slackClient.entity.presentDetails({
        trigger_id: event.trigger_id,
        metadata: metadata
      });

      // await postEntityPresentDetails(event.trigger_id, metadata) // if you prefer to make the API request without the client
    } else {
      // notify users that they must authenticated in order to view flexpane
      const user_auth_url = 'https://miro.com/login/' // put your OAuth authentication url here
      const error = {
        status: "custom",
        custom_message: "User must login"
      }

      // denies access to flexpane with error message
      await slackClient.entity.presentDetails({
        trigger_id: event.trigger_id,
        metadata: metadata,
        user_auth_required: true,
        user_auth_url: user_auth_url,
        error: error
      });

      // await postEntityPresentDetails(event.trigger_id, undefined, true, user_auth_url, error) // if you prefer to make the API request without the client
    }

  } catch (error) {
    console.error("Error handling entity_details_requested:\n", error);
  }
};

function validateUserAuth(user_id) : boolean {
  // your logic here to validate if user is authenticated
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