import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/",                   // the path on the web UI which when shared will unfurl the blink
        apiPath: "/api/actions/solserv",
      },
    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;