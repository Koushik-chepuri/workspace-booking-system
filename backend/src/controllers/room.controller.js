import { rooms } from "../models/rooms.js";

export const getRooms = (req, res) => {
  res.json(rooms);
};
