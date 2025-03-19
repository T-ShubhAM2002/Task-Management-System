import bcrypt from "bcryptjs";
import Agent from "../models/Agent.js";
import Task from "../models/Task.js";

export const createAgent = async (req, res) => {
  try {
    const { name, email, countryCode, mobileNumber, password } = req.body;

    // Validate required fields
    if (!name || !email || !countryCode || !mobileNumber || !password) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: {
          name: !name,
          email: !email,
          countryCode: !countryCode,
          mobileNumber: !mobileNumber,
          password: !password,
        },
      });
    }

    // Check if agent already exists for this user
    const existingAgent = await Agent.findOne({ email, user: req.user.userId });
    if (existingAgent) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new agent
    const agent = new Agent({
      name,
      email,
      countryCode,
      mobileNumber,
      password: hashedPassword,
      user: req.user.userId,
    });

    await agent.save();
    res.status(201).json({ message: "Agent created successfully", agent });
  } catch (error) {
    console.error("Error in createAgent:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.errors,
    });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ user: req.user.userId });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Get all tasks assigned to this agent for the current user
    const tasksToReassign = await Task.find({
      assignedAgent: agent._id,
      user: req.user.userId,
    });

    if (tasksToReassign.length > 0) {
      // Get all other active agents for the current user
      const remainingAgents = await Agent.find({
        _id: { $ne: agent._id },
        isActive: true,
        user: req.user.userId,
      });

      if (remainingAgents.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete the last active agent. There must be at least one agent to handle tasks.",
        });
      }

      // Distribute tasks evenly among remaining agents
      for (let i = 0; i < tasksToReassign.length; i++) {
        const task = tasksToReassign[i];
        const assignedAgent = remainingAgents[i % remainingAgents.length];

        await Task.findByIdAndUpdate(task._id, {
          assignedAgent: assignedAgent._id,
        });

        // Update agent's assigned tasks
        await Agent.findByIdAndUpdate(assignedAgent._id, {
          $push: { assignedTasks: task._id },
        });
      }

      // Clear assigned tasks from the agent to be deleted
      agent.assignedTasks = [];
      await agent.save();
    }

    // Now delete the agent
    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Agent deleted successfully and tasks redistributed",
      reassignedTasks: tasksToReassign.length,
    });
  } catch (error) {
    console.error("Error in deleteAgent:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
