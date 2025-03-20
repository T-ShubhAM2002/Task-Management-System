import express from "express";
import {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  redistributeTasks,
} from "../controllers/agentController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// secures the routes so only authenticated users can access them
router.use(auth);

router.post("/", createAgent); // creates a new agent
router.get("/", getAgents); // gets all agents
router.get("/:id", getAgentById); // gets an agent by its ID
router.put("/:id", updateAgent); // updates an agent by its ID
router.delete("/:id", deleteAgent); // deletes an agent by its ID
router.post("/redistribute", redistributeTasks);

export default router;
