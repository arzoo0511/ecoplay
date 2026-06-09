import { dbFunctions } from "../supabase";
import { safeSupabase } from "../supabaseClient";
import { resolveChallenge } from "./conflictResolvers";
import {
  getPendingWrites,
  getStaleWrites,
  incrementRetry,
  removePendingWrite,
} from "./offlineStore";

const MAX_RETRIES = 5;

type BingoPayload = {
  missionId?: {
    goalIndex: number;
    taskIndex: number;
  };
  goalIndex?: number;
  taskIndex?: number;
  newChecked?: boolean;
};

type ScorePayload = {
  userId?: string;
  user_id?: string;
  score?: number;
};

type ChallengePayload = Record<string, unknown> & {
  challengeId?: string;
  id?: string;
};

type QueryResult<T> = Promise<{ data: T | null; error: unknown }>;

type SupabaseLike = {
  from: (table: string) => {
    insert: (payload: unknown) => QueryResult<unknown>;
    upsert: (payload: unknown) => QueryResult<unknown>;
    select: (columns: string) => {
      eq: (column: string, value: unknown) => {
        single: () => QueryResult<Record<string, unknown>>;
        limit: (count: number) => QueryResult<Record<string, unknown>[]>;
        order: (
          column: string,
          options: { ascending: boolean }
        ) => {
          limit: (count: number) => QueryResult<Record<string, unknown>[]>;
        };
      };
    };
  };
};

export async function runSync(supabaseInstance: SupabaseLike): Promise<void> {
  try {
    const staleWrites = getStaleWrites(MAX_RETRIES);
    for (const staleWrite of staleWrites) {
      console.warn("Pruning stale write", {
        type: staleWrite.type,
        id: staleWrite.id,
      });
      removePendingWrite(staleWrite.id);
    }

    const writes = getPendingWrites();
    const priority = { score: 0, bingo: 1, challenge: 2 } as const;
    const ordered = [...writes].sort(
      (a, b) => priority[a.type] - priority[b.type]
    );

    for (const write of ordered) {
      try {
        if (write.type === "score") {
          const payload = write.payload as ScorePayload;
          const userId = payload.userId ?? payload.user_id;
          const score = payload.score;

          if (typeof userId !== "string" || typeof score !== "number") {
            incrementRetry(write.id);
            continue;
          }

          const existingScoreResult = await safeSupabase(async () => {
            const { data, error } = await supabaseInstance
              .from("game_scores")
              .select("score")
              .eq("user_id", userId)
              .order("score", { ascending: false })
              .limit(1);

            if (error) {
              return { data: null, error };
            }

            const rows = Array.isArray(data) ? data : [];
            const maxScore = rows.reduce<number>((currentMax, row) => {
              const rowScore =
                typeof row.score === "number" ? row.score : currentMax;
              return Math.max(currentMax, rowScore);
            }, 0);

            return {
              data: maxScore,
              error: null,
            };
          });

          if (existingScoreResult.offline || existingScoreResult.error) {
            incrementRetry(write.id);
            continue;
          }

          if (score <= (existingScoreResult.data ?? 0)) {
            removePendingWrite(write.id);
            continue;
          }

          const insertResult = await safeSupabase(() =>
            supabaseInstance.from("game_scores").insert(write.payload)
          );

          if (!insertResult.offline && !insertResult.error) {
            removePendingWrite(write.id);
          } else {
            incrementRetry(write.id);
          }
          continue;
        }

        if (write.type === "bingo") {
          const payload = write.payload as BingoPayload;
          const missionId = payload.missionId;
          const goalIndex = missionId?.goalIndex ?? payload.goalIndex;
          const taskIndex = missionId?.taskIndex ?? payload.taskIndex;

          if (typeof goalIndex !== "number" || typeof taskIndex !== "number") {
            incrementRetry(write.id);
            continue;
          }

          const result = await safeSupabase(async () => {
            const data = await dbFunctions.toggleBingoMission(goalIndex, taskIndex);
            return {
              data,
              error:
                data === null ? { message: "Unable to sync bingo mission" } : null,
            };
          });

          if (!result.offline && !result.error) {
            removePendingWrite(write.id);
          } else {
            incrementRetry(write.id);
          }
          continue;
        }

        if (write.type === "challenge") {
          const payload = write.payload as ChallengePayload;
          const challengeId = payload.challengeId ?? payload.id;

          if (typeof challengeId !== "string") {
            incrementRetry(write.id);
            continue;
          }

          const existingChallengeResult = await safeSupabase(async () => {
            const { data, error } = await supabaseInstance
              .from("challenges")
              .select("*")
              .eq("id", challengeId)
              .single();

            if (
              typeof error === "object" &&
              error !== null &&
              "code" in error &&
              (error as { code?: string }).code === "PGRST116"
            ) {
              return { data: null, error: null };
            }

            return { data, error };
          });

          if (existingChallengeResult.offline || existingChallengeResult.error) {
            incrementRetry(write.id);
            continue;
          }

          const resolvedPayload = resolveChallenge(
            payload,
            existingChallengeResult.data
          );

          const syncResult = await safeSupabase(() =>
            supabaseInstance.from("challenges").upsert(resolvedPayload)
          );

          if (!syncResult.offline && !syncResult.error) {
            removePendingWrite(write.id);
          } else {
            incrementRetry(write.id);
          }
        }
      } catch (err) {
        console.warn('[Sync] Failed to process write:', write.type, write.id, err);
        incrementRetry(write.id);
      }
    }
  } catch (err) {
    console.warn('[Sync] Unexpected error during sync run:', err);
  }
}
