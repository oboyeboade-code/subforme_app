import { Request, Response, NextFunction } from "express";
import { homeService } from "./home.service.js";

export const homeController = {
  async getTopProviders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const topProviders = await homeService.getTopProviders();

      res.status(200).json({
        status: "success",
        message: "Top providers fetched successfully",
        data: topProviders,
      });
    } catch (e) {
      next(e);
    }
  },

  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categories = await homeService.getCategories();

      res.status(200).json({
        status: "success",
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (e) {
      next(e);
    }
  },

  async getPlatformMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const platformMetrics = await homeService.getPlatformMetrics();

      res.status(200).json({
        status: "success",
        message: "Platform metrics fetched successfully",
        data: platformMetrics,
      });
    } catch (e) {
      next(e);
    }
  },
};