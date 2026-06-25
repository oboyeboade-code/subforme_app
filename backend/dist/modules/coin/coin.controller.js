import { coinService } from "./coin.service.js";
export const coinController = {
    getBalance: async (req, res, next) => {
        try {
            const data = await coinService.getBalance(req.user.userId);
            res.status(200).json({ status: "success", data });
        }
        catch (error) {
            next(error);
        }
    },
    addCoins: async (req, res, next) => {
        try {
            const { amount, type, metadata } = req.body;
            const data = await coinService.addCoins(req.user.userId, amount, type, metadata);
            res.status(200).json({ status: "success", message: "Coins added", data });
        }
        catch (error) {
            next(error);
        }
    },
    spendCoins: async (req, res, next) => {
        try {
            const { amount, type, metadata } = req.body;
            const data = await coinService.spendCoins(req.user.userId, amount, type, metadata);
            res.status(200).json({ status: "success", message: "Coins spent", data });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=coin.controller.js.map