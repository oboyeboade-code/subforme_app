export type SpiderHuntDifficulty = "easy" | "medium" | "hard";

export interface SpiderHuntPlayInput {
  choice: number;
  difficulty: SpiderHuntDifficulty;
}

export interface SpiderHuntPlayResult {
  won: boolean;
  spiderIndex: number;
  reward: number;
  balance: number | null;
}