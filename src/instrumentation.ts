import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (_error, _request, context) => {
  if (process.env.NODE_ENV !== "production" || process.env.APP_OPERATIONAL_LOGS !== "1") return;

  // The route template contains parameter names, never the requested path or card code.
  console.error("[site] unhandled_request_error", {
    route: context.routePath,
    type: context.routeType,
  });
};
