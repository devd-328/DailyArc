import { CONFIG_VERSION } from "@/lib/config";
import { isValidUsername } from "@/lib/username";
import { utcDay, type WrappedErrorCode } from "@/lib/wrapped";
import { loadWrapped } from "@/app/wrapped/load-wrapped";

const STATUS: Record<WrappedErrorCode, number> = {
  INVALID_USERNAME: 400,
  USER_NOT_FOUND: 404,
  PRIVATE_LIST: 403,
  EMPTY_LIST: 200,
  UPSTREAM_BUSY: 503,
};

export async function GET(_request: Request, ctx: RouteContext<"/api/wrapped/[username]">) {
  const { username } = await ctx.params;
  if (!isValidUsername(username)) {
    return Response.json({ ok: false, code: "INVALID_USERNAME" }, { status: 400 });
  }

  const result = await loadWrapped(username, utcDay(new Date()), CONFIG_VERSION);
  if (!result.ok) {
    return Response.json({ ok: false, code: result.code }, { status: STATUS[result.code] });
  }
  return Response.json(result);
}
