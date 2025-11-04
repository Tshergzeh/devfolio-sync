import { Router } from "express";
import { userController } from "@/controllers/user.controller";
import { authenticate, authorizeRoles } from "@/middleware/auth";

const router = Router();

router.get("/", authenticate, authorizeRoles("admin"), userController.getAllUsers);

export default router;
