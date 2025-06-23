import { getAllUser } from "../models/user.model.js";

const getAllUserController = async (req, res) => {
  try {
    const user = await getAllUser();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getAllUserController };
