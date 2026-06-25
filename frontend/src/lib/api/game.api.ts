import { apiRequest, ApiResponse } from "./client";

export type StartResponse = {
  sessionId: string;
};

export type PlayResponse = {
  won: boolean;
  spiderIndex: number;
  reward: number;
  streak: number;
  totalEarned: number;
  rounds: number;
};

export type CashoutResponse = {
  balance: number;
  coinsEarned: number;
};

export type SpiderSessionState = {
  sessionId: string;
  difficulty: "easy" | "medium" | "hard";
  lastRound?: {
    won: boolean;
    spiderIndex: number;
    reward: number;
    streak: number;
    totalEarned: number;
  };
};

export const gameApi = {
  startSpiderHunt(difficulty: string): Promise<ApiResponse<StartResponse>> {
    return apiRequest("/api/games/spider-hunt/start", {
      method: "POST",
      body: JSON.stringify({ difficulty }),
      headers: { "Content-Type": "application/json" },
    });
  },

  playSpiderHunt(payload: {
    sessionId: string;
    choice: number;
    difficulty: string;
  }): Promise<ApiResponse<PlayResponse>> {
    return apiRequest("/api/games/spider-hunt/play", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },

  cashoutSpiderHunt(payload: {
    sessionId: string;
  }): Promise<ApiResponse<CashoutResponse>> {
    return apiRequest("/api/games/spider-hunt/cashout", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },
};