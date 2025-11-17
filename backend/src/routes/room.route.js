import express from "express";
import { getRooms } from "../controllers/room.controller.js";

const router = express.Router();

router.get("/", getRooms);

export default router;
