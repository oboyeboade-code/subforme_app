import { coinService } from "../coin/coin.service.js";
import { SpiderHuntModel } from "./spiderHunt.model.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { SpiderHuntSessionModel } from "./spiderHuntSession.model.js";

const PRESETS = {
  easy: { size: 3, reward: 2 },
  medium: { size: 4, reward: 5 },
  hard: { size: 5, reward: 10 },
} as const;

type Difficulty = keyof typeof PRESETS;



export const spiderHuntService = {
    startSession: async (userId: string, difficulty: Difficulty) => {
    const session = await SpiderHuntSessionModel.create({
        userId,
        difficulty,
        totalEarned: 0,
        streak: 0,
        rounds: 0,
        active: true,
    });

    return { sessionId: session._id };
    },
    play: async (
    userId: string,
    sessionId: string,
    choice: number,
    difficulty: Difficulty
    ) => {
    const session = await SpiderHuntSessionModel.findOne({
        _id: sessionId,
        userId,
        active: true,
    });

    if (!session) throw new AppError("Invalid session", 400);

    const config = PRESETS[difficulty];
    const gridSize = config.size * config.size;

    const spiderIndex = Math.floor(Math.random() * gridSize);
    const won = spiderIndex === choice;

    const streakBonus = session.streak >= 2 ? session.streak : 0;
    const reward = won ? config.reward + streakBonus : 0;

    // update session state
    session.rounds += 1;
    session.lastPlayedAt = new Date();

    if (won) {
        session.streak += 1;
        session.totalEarned += reward;
    } else {
        session.streak = 0;
    }

    await session.save();

    // log round
    await SpiderHuntModel.create({
        userId,
        sessionId,
        difficulty,
        choice,
        spiderIndex,
        won,
        reward,
    });

    return {
        won,
        spiderIndex,
        reward,
        streak: session.streak,
        totalEarned: session.totalEarned,
        rounds: session.rounds,
    };
    },
    cashout: async (userId: string, sessionId: string) => {
    const session = await SpiderHuntSessionModel.findOne({
        _id: sessionId,
        userId,
        active: true,
    });

    if (!session) throw new AppError("Invalid session", 400);

    const earned = session.totalEarned;

    if (earned <= 0) {
        return { balance: null, coinsEarned: 0 };
    }

    const res = await coinService.addCoins(
        userId,
        earned,
        "game",
        {
        game: "spider_hunt",
        sessionId,
        }
    );

    session.active = false;
    await session.save();

    return {
        balance: res.balance,
        coinsEarned: earned,
    };
    },
};