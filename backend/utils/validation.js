import fs from "fs";
import ExcelJS from "exceljs";
import { Readable } from "stream";

// File validation constants
export const FILE_VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ALLOWED_EXTENSIONS: [".csv", ".xlsx", ".xls"],
  MIN_TASKS: 1,
  MAX_TASKS: 1000,
};

// Data validation constants
export const DATA_VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s-']+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^\+?[\d\s-()]+$/,
  },
  NOTES: {
    MAX_LENGTH: 500,
  },
};

// Agent validation constants
export const AGENT_VALIDATION = {
  MIN_AGENTS: 1,
  MAX_TASKS_PER_AGENT: 200,
  MIN_TASKS_PER_BATCH: 1,
};

export const validateFile = (file) => {
  const errors = [];
  const warnings = [];

  // Check if file exists
  if (!file) {
    errors.push("No file uploaded");
    return { isValid: false, errors, warnings };
  }

  // Check file size
  if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
    errors.push(
      `File size exceeds maximum limit of ${
        FILE_VALIDATION.MAX_FILE_SIZE / 1024 / 1024
      }MB`
    );
  }

  // Check file type
  const fileExtension = "." + file.originalname.split(".").pop().toLowerCase();
  if (!FILE_VALIDATION.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push("Invalid file extension. Allowed types: CSV, XLSX, XLS");
  }

  if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push("Invalid file type. Allowed types: CSV, XLSX, XLS");
  }

  // Check if file is empty
  if (!file.buffer || file.buffer.length === 0) {
    errors.push("File is empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const parseExcelFile = async (file) => {
  const workbook = new ExcelJS.Workbook();
  const fileBuffer = file.buffer;

  try {
    if (file.mimetype === "text/csv") {
      await workbook.csv.read(Readable.from(fileBuffer));
    } else {
      await workbook.xlsx.load(fileBuffer);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("No worksheet found in the file");
    }

    const tasks = [];
    const headers = {};

    // Get headers
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value;
    });

    // Read rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const task = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          task[header] = cell.value?.toString().trim() || "";
        }
      });

      if (Object.keys(task).length > 0) {
        tasks.push(task);
      }
    });

    return tasks;
  } catch (error) {
    throw new Error(`Error parsing file: ${error.message}`);
  }
};

export const validateTaskData = (record, existingPhoneNumbers = new Set()) => {
  const errors = [];
  const warnings = [];

  // Validate FirstName
  if (!record.FirstName) {
    errors.push("FirstName is required");
  } else {
    const name = record.FirstName.trim();
    if (name.length < DATA_VALIDATION.NAME.MIN_LENGTH) {
      errors.push(
        `FirstName must be at least ${DATA_VALIDATION.NAME.MIN_LENGTH} characters`
      );
    }
    if (name.length > DATA_VALIDATION.NAME.MAX_LENGTH) {
      errors.push(
        `FirstName must not exceed ${DATA_VALIDATION.NAME.MAX_LENGTH} characters`
      );
    }
    if (!DATA_VALIDATION.NAME.PATTERN.test(name)) {
      errors.push("FirstName contains invalid characters");
    }
  }

  // Validate Phone
  if (!record.Phone) {
    errors.push("Phone is required");
  } else {
    const phone = record.Phone.toString().trim().replace(/\s+/g, "");
    if (phone.length < DATA_VALIDATION.PHONE.MIN_LENGTH) {
      errors.push(
        `Phone number must be at least ${DATA_VALIDATION.PHONE.MIN_LENGTH} digits`
      );
    }
    if (phone.length > DATA_VALIDATION.PHONE.MAX_LENGTH) {
      errors.push(
        `Phone number must not exceed ${DATA_VALIDATION.PHONE.MAX_LENGTH} digits`
      );
    }
    if (!DATA_VALIDATION.PHONE.PATTERN.test(phone)) {
      errors.push("Phone number contains invalid characters");
    }
    if (existingPhoneNumbers.has(phone)) {
      errors.push("Duplicate phone number found");
    } else {
      existingPhoneNumbers.add(phone);
    }
  }

  // Validate Notes
  if (record.Notes && record.Notes.length > DATA_VALIDATION.NOTES.MAX_LENGTH) {
    errors.push(
      `Notes must not exceed ${DATA_VALIDATION.NOTES.MAX_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: {
      firstName: record.FirstName?.trim(),
      phone: record.Phone?.toString().trim().replace(/\s+/g, ""),
      notes: record.Notes?.trim() || "",
    },
  };
};

export const validateAgents = async (agents) => {
  const errors = [];
  const warnings = [];

  // Check minimum number of agents
  if (agents.length < AGENT_VALIDATION.MIN_AGENTS) {
    errors.push(
      `At least ${AGENT_VALIDATION.MIN_AGENTS} agent is required for task distribution`
    );
  }

  // Check agent status and workload
  for (const agent of agents) {
    if (!agent.isActive) {
      warnings.push(`Agent ${agent.name} is not active`);
    }

    const currentTaskCount = agent.assignedTasks?.length || 0;
    if (currentTaskCount >= AGENT_VALIDATION.MAX_TASKS_PER_AGENT) {
      errors.push(`Agent ${agent.name} has reached maximum task capacity`);
    } else if (currentTaskCount >= AGENT_VALIDATION.MAX_TASKS_PER_AGENT * 0.8) {
      warnings.push(`Agent ${agent.name} is approaching maximum task capacity`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const calculateDistribution = (tasks, agents) => {
  // Ensure we have active agents
  const activeAgents = agents.filter((agent) => agent.isActive);

  if (activeAgents.length === 0) {
    return {
      distribution: [],
      metrics: {
        totalTasks: tasks.length,
        baseTasksPerAgent: 0,
        remainingTasks: tasks.length,
        averageTasksPerAgent: 0,
        workloadVariance: 0,
      },
    };
  }

  // Basic equal distribution
  const baseTasksPerAgent = Math.floor(tasks.length / activeAgents.length);
  const remainingTasks = tasks.length % activeAgents.length;

  // Calculate current workload
  const agentWorkloads = activeAgents.map((agent, index) => ({
    agent,
    currentTasks: agent.assignedTasks?.length || 0,
    // Add one extra task to agents until remainingTasks are distributed
    newTasks: baseTasksPerAgent + (index < remainingTasks ? 1 : 0),
  }));

  // Sort by current workload to ensure fair distribution
  agentWorkloads.sort(
    (a, b) => a.currentTasks + a.newTasks - (b.currentTasks + b.newTasks)
  );

  return {
    distribution: agentWorkloads,
    metrics: {
      totalTasks: tasks.length,
      activeAgents: activeAgents.length,
      totalAgents: agents.length,
      baseTasksPerAgent,
      remainingTasks,
      averageTasksPerAgent: tasks.length / activeAgents.length,
      workloadVariance: calculateWorkloadVariance(agentWorkloads),
    },
  };
};

const calculateWorkloadVariance = (agentWorkloads) => {
  const totalWorkloads = agentWorkloads.map(
    (aw) => aw.currentTasks + aw.newTasks
  );
  const average =
    totalWorkloads.reduce((a, b) => a + b, 0) / totalWorkloads.length;
  const variance =
    totalWorkloads.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) /
    totalWorkloads.length;
  return variance;
};
