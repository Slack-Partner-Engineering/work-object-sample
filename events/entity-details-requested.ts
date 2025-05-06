import { get_miro_board } from '../services/miro'
import { get_github_issue } from '../services/github'
import { post_entity_present_details } from '../services/slack'
import { convert_datetime_to_timestamp } from '../utils/time'
import { extract_github_owner_from_url, extract_github_repo_from_url } from '../utils/github'


export const entity_details_requested = async (event, slackClient) => {
  try {
    let metadata;
    const link = event.link;

    if (link.domain === "github.com") {
      const owner = extract_github_owner_from_url(link.url);
      const repo = extract_github_repo_from_url(link.url);
      const issueId = event.external_ref.id // we set this external reference ID previously in `link_shared.ts`

      const issue = await get_github_issue(owner, repo, issueId);
      metadata = createGitHubIssueTaskEntityFlexpane(event, issue);

    } else if (link.domain === "miro.com") {
      const boardId = event.external_ref.id // we set this external reference ID previously in `link_shared.ts`

      const board = await get_miro_board(boardId);
      metadata = createMiroBoardFileEntityFlexpane(event, board);

    } else {
      throw("Unrecognized Work Object unfurl");
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
          metadata: undefined,
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
        metadata: undefined,
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