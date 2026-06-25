import { spiderHuntService } from "./spiderHunt.service.js";
export const spiderHuntController = {
    start: async (req, res, next) => {
        try {
            const data = await spiderHuntService.startSession(req.user.userId, req.body.difficulty);
            res.json({ status: "success", data });
        }
        catch (e) {
            next(e);
        }
    },
    play: async (req, res, next) => {
        try {
            const data = await spiderHuntService.play(req.user.userId, req.body.sessionId, req.body.choice, req.body.difficulty);
            res.json({ status: "success", data });
        }
        catch (e) {
            next(e);
        }
    },
    cashout: async (req, res, next) => {
        try {
            const data = await spiderHuntService.cashout(req.user.userId, req.body.sessionId);
            res.json({ status: "success", data });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=spiderHunt.controller.js.map