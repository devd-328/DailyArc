import { loadCardFonts } from "@/app/api/card/load-fonts";
import { loadWrapped } from "@/app/wrapped/load-wrapped";
import { CardImage } from "@/components/CardImage";
import { CARD_SIZE, cardCacheControl, parseCardFormat } from "@/lib/card";
import { CONFIG_VERSION } from "@/lib/config";
import { isValidUsername } from "@/lib/username";
import { utcDay, type WrappedErrorCode } from "@/lib/wrapped";
import { ImageResponse } from "next/og";

const STATUS: Record<WrappedErrorCode, number> = {
  INVALID_USERNAME: 400,
  USER_NOT_FOUND: 404,
  PRIVATE_LIST: 403,
  EMPTY_LIST: 200,
  UPSTREAM_BUSY: 503,
};

export async function GET(request: Request, ctx: RouteContext<"/api/card/[username]">) {
  const { username } = await ctx.params;
  const format = parseCardFormat(new URL(request.url).searchParams.get("format"));
  if (format == null) {
    return Response.json({ ok: false, code: "INVALID_FORMAT" }, { status: 400 });
  }
  if (!isValidUsername(username)) {
    return Response.json({ ok: false, code: "INVALID_USERNAME" }, { status: 400 });
  }

  const result = await loadWrapped(username, utcDay(new Date()), CONFIG_VERSION);
  if (!result.ok) {
    return Response.json({ ok: false, code: result.code }, { status: STATUS[result.code] });
  }

  const fonts = await loadCardFonts(result.card);
  const size = CARD_SIZE[format];
  return new ImageResponse(<CardImage data={result.card} format={format} />, {
    ...size,
    fonts,
    headers: {
      "Cache-Control": cardCacheControl(false),
    },
  });
}
