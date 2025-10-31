import { Router } from "express";
import { authController } from "@/controllers/auth.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/change-password", authenticate, authController.changePassword);

export default router;
