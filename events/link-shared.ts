import { get_miro_board } from '../services/miro'
import { get_github_issue } from '../services/github'
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
        metadata = createGitHubIssueTaskEntityUnfurl(link, owner, repo, issue);

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

function createGitHubIssueTaskEntityUnfurl(link, owner, repo, issue) {
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