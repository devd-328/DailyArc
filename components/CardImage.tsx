import { CARD_SIZE, CARD_URL_MARK, completionLabel, formatCardCount, type CardFormat } from "@/lib/card";
import { rankForLevel } from "@/lib/ranks";
import { GENRE_CHIP_FILL, tokens } from "@/lib/tokens";
import type { WrappedCardData } from "@/lib/wrapped";

const FONT_DISPLAY = "Dela Gothic One";
const FONT_BODY = "Zen Kaku Gothic New";

type Props = {
  data: WrappedCardData;
  format: CardFormat;
};

export function CardImage({ data, format }: Props) {
  const size = CARD_SIZE[format];
  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        backgroundColor: tokens.paper,
        color: tokens.ink,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {format === "story" ? <StoryLayout data={data} /> : <SquareLayout data={data} />}
    </div>
  );
}

function StoryLayout({ data }: { data: WrappedCardData }) {
  const rank = data.level != null ? rankForLevel(data.level) : null;
  const heroLines = data.watcherTypeLabel.split(" ");

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        display: "flex",
        backgroundColor: tokens.paper,
        position: "relative",
      }}
    >
      <HalftoneBand height={1000} />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 96,
          left: 96,
          backgroundColor: tokens.sun,
          border: `6px solid ${tokens.ink}`,
          boxShadow: `9px 9px 0 ${tokens.ink}`,
          padding: "14px 40px",
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 40,
          transform: "rotate(-2deg)",
        }}
      >
        {data.username}
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 108,
          right: 96,
          fontFamily: FONT_DISPLAY,
          fontSize: 40,
        }}
      >
        DailyArc
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: 290,
          left: 96,
          fontFamily: FONT_DISPLAY,
          fontSize: 168,
          lineHeight: 1.02,
          transform: "rotate(-3deg)",
          transformOrigin: "left top",
          textShadow: `8px 8px 0 ${tokens.pink}`,
        }}
      >
        {heroLines.map((line) => (
          <div key={line} style={{ display: "flex" }}>
            {line}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 690,
          left: 96,
          width: 860,
          fontFamily: FONT_BODY,
          fontSize: 40,
          fontWeight: 500,
          lineHeight: 1.35,
        }}
      >
        {data.watcherLine}
      </div>
      <StatRow
        data={data}
        style={{ position: "absolute", top: 850, left: 96, width: 888 }}
      />
      <GenreBlock
        genres={data.topGenres}
        style={{ position: "absolute", top: 1160, left: 96, width: 888 }}
      />
      {data.hotTake ? (
        <HotTake
          title={data.hotTake.title}
          userScore={data.hotTake.userScore}
          communityScore={data.hotTake.communityScore}
          style={{ position: "absolute", top: 1380, left: 96, width: 888 }}
        />
      ) : null}
      <Footer
        data={data}
        rank={rank}
        style={{ position: "absolute", top: 1660, left: 96, right: 96 }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 96,
          bottom: 56,
          fontFamily: FONT_BODY,
          fontSize: 28,
          fontWeight: 700,
          color: tokens.inkSoft,
        }}
      >
        {CARD_URL_MARK}
      </div>
    </div>
  );
}

function SquareLayout({ data }: { data: WrappedCardData }) {
  const rank = data.level != null ? rankForLevel(data.level) : null;
  const heroLines = data.watcherTypeLabel.split(" ");

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        display: "flex",
        flexDirection: "column",
        backgroundColor: tokens.paper,
        padding: 96,
        position: "relative",
      }}
    >
      <HalftoneBand height={480} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            display: "flex",
            backgroundColor: tokens.sun,
            border: `6px solid ${tokens.ink}`,
            boxShadow: `9px 9px 0 ${tokens.ink}`,
            padding: "10px 28px",
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: 34,
            transform: "rotate(-2deg)",
          }}
        >
          {data.username}
        </div>
        <div style={{ display: "flex", fontFamily: FONT_DISPLAY, fontSize: 34 }}>DailyArc</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 28,
          fontFamily: FONT_DISPLAY,
          fontSize: 76,
          lineHeight: 1.05,
          textShadow: `6px 6px 0 ${tokens.pink}`,
        }}
      >
        {heroLines.map((line) => (
          <div key={line} style={{ display: "flex" }}>
            {line}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 16,
          fontFamily: FONT_BODY,
          fontSize: 28,
          fontWeight: 500,
          lineHeight: 1.35,
        }}
      >
        {data.watcherLine}
      </div>
      <StatRow data={data} style={{ marginTop: 28, width: 888 }} />
      <GenreBlock genres={data.topGenres} style={{ marginTop: 28, width: 888 }} compact />
      {data.hotTake ? (
        <HotTake
          title={data.hotTake.title}
          userScore={data.hotTake.userScore}
          communityScore={data.hotTake.communityScore}
          compact
          style={{ marginTop: 24, width: 888 }}
        />
      ) : (
        <div style={{ display: "flex", flex: 1 }} />
      )}
      <div style={{ display: "flex", flex: 1 }} />
      <Footer data={data} rank={rank} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 12,
          fontFamily: FONT_BODY,
          fontSize: 28,
          fontWeight: 700,
          color: tokens.inkSoft,
        }}
      >
        {CARD_URL_MARK}
      </div>
    </div>
  );
}

function HalftoneBand({ height }: { height: number }) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height,
        backgroundImage: `radial-gradient(circle, ${tokens.halftone} 4.5px, transparent 5px)`,
        backgroundSize: "22px 22px",
      }}
    />
  );
}

function StatRow({
  data,
  style,
}: {
  data: WrappedCardData;
  style?: Record<string, string | number>;
}) {
  return (
    <div style={{ display: "flex", gap: 16, ...style }}>
      <StatBlock value={formatCardCount(data.hours)} label="Hours" />
      <StatBlock value={formatCardCount(data.episodes)} label="Episodes" />
      <StatBlock value={completionLabel(data.completionRate)} label="Completed" />
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        backgroundColor: tokens.card,
        border: `6px solid ${tokens.ink}`,
        boxShadow: `10px 10px 0 ${tokens.ink}`,
        padding: "26px 12px 22px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: FONT_DISPLAY,
          fontSize: 64,
          lineHeight: 1.1,
          letterSpacing: -1.28,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 10,
          fontFamily: FONT_BODY,
          fontSize: 28,
          fontWeight: 700,
          color: tokens.inkSoft,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function GenreBlock({
  genres,
  style,
  compact = false,
}: {
  genres: readonly string[];
  style?: Record<string, string | number>;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      <div
        style={{
          display: "flex",
          marginBottom: compact ? 12 : 18,
          fontFamily: FONT_BODY,
          fontSize: compact ? 28 : 34,
          fontWeight: 700,
          color: tokens.inkSoft,
        }}
      >
        Top genres
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {genres.map((genre, index) => (
          <div
            key={genre}
            style={{
              display: "flex",
              backgroundColor: GENRE_CHIP_FILL[index % GENRE_CHIP_FILL.length],
              border: `6px solid ${tokens.ink}`,
              borderRadius: 999,
              padding: compact ? "8px 28px" : "12px 36px",
              fontFamily: FONT_BODY,
              fontSize: compact ? 34 : 40,
              fontWeight: 700,
            }}
          >
            {genre}
          </div>
        ))}
      </div>
    </div>
  );
}

function HotTake({
  title,
  userScore,
  communityScore,
  style,
  compact = false,
}: {
  title: string;
  userScore: number;
  communityScore: number;
  style?: Record<string, string | number>;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: tokens.card,
        border: `6px solid ${tokens.ink}`,
        borderRadius: 36,
        boxShadow: `10px 10px 0 ${tokens.ink}`,
        padding: compact ? "20px 28px 24px" : "34px 40px 38px",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: 10,
          fontFamily: FONT_DISPLAY,
          fontSize: compact ? 28 : 34,
          color: tokens.pink,
        }}
      >
        Hot take
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: FONT_BODY,
          fontSize: compact ? 28 : 40,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {`You gave ${title} a ${userScore}. Everyone else gave it ${communityScore}.`}
      </div>
    </div>
  );
}

function Footer({
  data,
  rank,
  style,
}: {
  data: WrappedCardData;
  rank: ReturnType<typeof rankForLevel> | null;
  style?: Record<string, string | number>;
}) {
  if (rank && data.level != null) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 28, ...style }}>
        <div
          style={{
            display: "flex",
            width: 150,
            height: 150,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tokens.rank[rank],
            color: tokens.rankText[rank],
            border: `6px solid ${tokens.ink}`,
            borderRadius: 2,
            fontFamily: FONT_DISPLAY,
            fontSize: 100,
            lineHeight: 1,
          }}
        >
          {rank}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: FONT_DISPLAY, fontSize: 76, lineHeight: 1.05 }}>
            Level {data.level}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: FONT_BODY,
              fontSize: 28,
              fontWeight: 700,
              color: tokens.inkSoft,
            }}
          >
            {rank}-rank {data.watcherTypeLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        fontFamily: FONT_BODY,
        fontSize: 34,
        fontWeight: 700,
        color: tokens.inkSoft,
        ...style,
      }}
    >
      Anime Wrapped for {data.username}
    </div>
  );
}
