import { Router } from "express";
import { userController } from "@/controllers/user.controller.js";
import { authenticate, authorizeRoles } from "@/middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("admin"), userController.getAllUsers);

export default router;
