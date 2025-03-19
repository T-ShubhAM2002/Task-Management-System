import Task from "../models/Task.js";
import Agent from "../models/Agent.js";
import {
  validateFile,
  validateTaskData,
  validateAgents,
  calculateDistribution,
  parseExcelFile,
} from "../utils/validation.js";

// Handles the request to upload tasks from an Excel file
export const uploadTasks = async (req, res) => {
  try {
    console.log("Request received:", {
      file: req.file,
      body: req.body,
      headers: req.headers,
    });

    // Ensures the uploaded file is valid
    const fileValidation = validateFile(req.file);
    if (!fileValidation.isValid) {
      console.log("File validation failed:", fileValidation.errors);
      return res.status(400).json({
        success: false,
        errors: fileValidation.errors,
        warnings: fileValidation.warnings,
      });
    }

    // Logs the count of active agents for the current user
    let agents = await Agent.find({ isActive: true, user: req.user.userId });
    console.log("Found active agents:", agents.length);

    // If no active agents found, it fetches all agents for the current user
    if (agents.length === 0) {
      agents = await Agent.find({ user: req.user.userId });
      console.log("Found total agents:", agents.length);

      if (agents.length > 0) {
        await Agent.updateMany({ user: req.user.userId }, { isActive: true });
        agents = agents.map((agent) => ({
          ...agent.toObject(),
          isActive: true,
        }));
      }
    }
    // Checks if the agents meet the required criteria
    const agentValidation = await validateAgents(agents);
    if (!agentValidation.isValid) {
      console.log("Agent validation failed:", agentValidation.errors);
      return res.status(400).json({
        success: false,
        errors: agentValidation.errors,
        warnings: agentValidation.warnings,
      });
    }

    // Parses the file and to extract tasks
    console.log("Parsing file...");
    const tasks = await parseExcelFile(req.file);
    console.log("Parsed tasks:", tasks.length);

    // Validates the tasks
    const validationResults = validateTasksData(tasks);
    if (!validationResults.isValid) {
      console.log("Task validation failed:", validationResults.errors);
      return res.status(400).json({
        success: false,
        errors: validationResults.errors,
        warnings: validationResults.warnings,
        failedRecords: validationResults.failedRecords,
      });
    }

    // Distributes the tasks among the active agents
    const distribution = calculateDistribution(
      validationResults.validTasks,
      agents
    );
    console.log("Distribution calculated:", {
      totalTasks: distribution.metrics.totalTasks,
      agents: agents.length,
    });

    // Save tasks and update agent assignments
    const savedTasks = await saveTasks(
      validationResults.validTasks,
      distribution,
      req.user.userId
    );
    console.log("Tasks saved:", savedTasks.length);

    return res.status(200).json({
      success: true,
      message: "Tasks uploaded successfully",
      taskCount: savedTasks.length,
      distribution: distribution.metrics,
      warnings: [...validationResults.warnings, ...agentValidation.warnings],
    });
  } catch (error) {
    console.error("Error in uploadTasks:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};
// Validate tasks data
const validateTasksData = (tasks) => {
  const errors = [];
  const warnings = [];
  const validTasks = [];
  const failedRecords = [];
  const existingPhoneNumbers = new Set();

  // Check if no tasks are found
  if (tasks.length === 0) {
    errors.push("No tasks found in file");
    return { isValid: false, errors, warnings, failedRecords };
  }

  // Validate each task
  for (let i = 0; i < tasks.length; i++) {
    const validation = validateTaskData(tasks[i], existingPhoneNumbers);
    if (validation.isValid) {
      validTasks.push(validation.sanitizedData);
    } else {
      failedRecords.push({
        rowNumber: i + 2, // Adding 2 to account for 0-based index and header row like (Name, Phone, Notes)
        data: tasks[i],
        errors: validation.errors,
      });
    }
    warnings.push(...validation.warnings);
  }

  // Return validation results
  return {
    isValid: failedRecords.length === 0,
    errors: failedRecords.length > 0 ? ["Some records failed validation"] : [],
    warnings,
    validTasks,
    failedRecords,
  };
};

// Save tasks and update agent assignments
const saveTasks = async (tasks, distribution, userId) => {
  const savedTasks = [];
  let currentAgentIndex = 0;

  // Save each task and update agent assignments
  for (const task of tasks) {
    const agent = distribution.distribution[currentAgentIndex].agent;

    const newTask = new Task({
      firstName: task.firstName,
      phone: task.phone,
      notes: task.notes,
      assignedAgent: agent._id,
      user: userId,
      status: "pending",
    });

    const savedTask = await newTask.save();
    savedTasks.push(savedTask);

    // Update agent's assigned tasks
    await Agent.findByIdAndUpdate(agent._id, {
      $push: { assignedTasks: savedTask._id },
    });

    // Move to next agent in round-robin fashion
    currentAgentIndex =
      (currentAgentIndex + 1) % distribution.distribution.length;
  }

  return savedTasks;
};

// Get all tasks for the current user
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId })
      .populate("assignedAgent", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// Update task status based on its ID
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!["pending", "in-progress", "completed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: req.user.userId },
      {
        status,
        completedAt: status === "completed" ? new Date() : undefined,
      },
      { new: true }
    ).populate("assignedAgent", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// Get tasks by agent for the current user
export const getTasksByAgent = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedAgent: req.params.agentId,
      user: req.user.userId,
    })
      .populate("assignedAgent", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Error in getTasksByAgent:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// Delete task for the current user
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({ _id: taskId, user: req.user.userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Remove task reference from the assigned agent
    if (task.assignedAgent) {
      await Agent.findByIdAndUpdate(task.assignedAgent, {
        $pull: { assignedTasks: task._id },
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};
