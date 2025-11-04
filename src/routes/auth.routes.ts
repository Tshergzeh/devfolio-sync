import { Router } from "express";
import { authController } from "@/controllers/auth.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

router.post("/register", authenticate, authController.register);
router.post("/login", authController.login);
router.put("/change-password-first-login", authenticate, authController.updateFirstLoginPassword);
router.put("/change-password", authenticate, authController.changePassword);
router.delete("/:id", authenticate, authController.deleteUser);

export default router;
