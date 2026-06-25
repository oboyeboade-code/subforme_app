import { Request, Response, NextFunction } from "express";
import { serviceService } from "./service.service.js";

export const serviceController = {
  allServices: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const servicesData = await serviceService.allServices();
      res.status(200).json({
        status: "success",
        message: "Services fetched successfully",
        data: { services: servicesData },
      });
    } catch (error) {
      next(error);
    }
  },
};
