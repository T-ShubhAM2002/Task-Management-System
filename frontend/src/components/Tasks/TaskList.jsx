import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
    Card,
    CardContent,
    Menu,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { taskService, agentService } from '../../services/api';
import { toast } from 'react-toastify';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [taskStats, setTaskStats] = useState({});
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            await fetchAgents();
            await fetchTasks();
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await agentService.getAgents();
            // Log the response to see its structure
            console.log('Agents response:', response);
            // Handle both array and object with data property
            const agentsList = Array.isArray(response) ? response : response.data || [];
            setAgents(agentsList);
        } catch (error) {
            console.error('Error fetching agents:', error);
            toast.error('Failed to fetch agents');
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTasks();
            const taskList = response.tasks || [];
            setTasks(taskList);

            // Calculate task distribution stats
            const stats = {};
            // Initialize counts for all agents to 0
            agents.forEach(agent => {
                stats[agent._id] = 0;
            });

            // Count tasks for each agent
            taskList.forEach(task => {
                if (task.assignedAgent && task.assignedAgent._id) {
                    stats[task.assignedAgent._id] = (stats[task.assignedAgent._id] || 0) + 1;
                }
            });

            console.log('Task Stats:', {
                totalTasks: taskList.length,
                stats,
                tasks: taskList
            });

            setTaskStats(stats);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    // Refresh task stats when agents change
    useEffect(() => {
        if (tasks.length > 0) {
            // Recalculate stats when agents list changes
            const stats = {};
            agents.forEach(agent => {
                stats[agent._id] = 0;
            });

            tasks.forEach(task => {
                if (task.assignedAgent && task.assignedAgent._id) {
                    stats[task.assignedAgent._id] = (stats[task.assignedAgent._id] || 0) + 1;
                }
            });
            setTaskStats(stats);
        }
    }, [agents, tasks]);

    // Add a debug log for agents and task stats
    useEffect(() => {
        console.log('Current State:', {
            agents,
            taskStats,
            tasks
        });
    }, [agents, taskStats, tasks]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesAgent = !selectedAgent ||
            (task.assignedAgent && task.assignedAgent._id === selectedAgent);
        const matchesSearch = !searchTerm ||
            ['firstName', 'phone', 'notes', 'status'].some(field =>
                task[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            (task.assignedAgent?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesAgent && matchesSearch;
    });

    const getAgentName = (agentId) => {
        if (typeof agentId === 'object' && agentId.name) {
            return agentId.name;
        }
        const agent = agents.find(a => a._id === agentId);
        return agent ? agent.name : 'Unassigned';
    };

    const handleStatusClick = (event, task) => {
        setSelectedTask(task);
        setStatusAnchorEl(event.currentTarget);
    };

    const handleStatusClose = () => {
        setStatusAnchorEl(null);
        setSelectedTask(null);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await taskService.updateTaskStatus(selectedTask._id, newStatus);
            toast.success('Task status updated successfully');
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error(error.response?.data?.message || 'Failed to update task status');
        }
        handleStatusClose();
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setDeleteDialogOpen(true);
    };

    const handleDeleteClose = () => {
        setTaskToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            await taskService.deleteTask(taskToDelete._id);
            toast.success('Task deleted successfully');
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error(error.response?.data?.message || 'Failed to delete task');
        }
        handleDeleteClose();
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Task Distribution
            </Typography>

            {/* Task Distribution Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Total Tasks Card */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                    Total Tasks
                                </Typography>
                                <Typography variant="h3" component="div">
                                    {tasks.length}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Assigned: {tasks.filter(task => task.assignedAgent).length}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Unassigned: {tasks.filter(task => !task.assignedAgent).length}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{
                                backgroundColor: 'primary.main',
                                borderRadius: '50%',
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AssignmentIcon sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Agent Cards */}
                {agents.length > 0 && agents.map((agent) => (
                    <Grid item xs={12} sm={6} md={2.4} key={agent._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                    {agent.name}
                                </Typography>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    {taskStats[agent._id] || 0}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Tasks Assigned
                                    </Typography>
                                    <Typography variant="body2" color="primary">
                                        {((taskStats[agent._id] || 0) / (tasks.length || 1) * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Search and Filter */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Filter by Agent</InputLabel>
                        <Select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            label="Filter by Agent"
                        >
                            <MenuItem value="">All Agents</MenuItem>
                            {agents.map((agent) => (
                                <MenuItem key={agent._id} value={agent._id}>
                                    {agent.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                    <TextField
                        fullWidth
                        label="Search Tasks"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Grid>
            </Grid>

            {/* Tasks Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No tasks found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTasks
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((task) => (
                                    <TableRow key={task._id}>
                                        <TableCell>{task.firstName}</TableCell>
                                        <TableCell>{task.phone}</TableCell>
                                        <TableCell>{task.notes}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getAgentName(task.assignedAgent)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={task.status}
                                                color={
                                                    task.status === 'completed'
                                                        ? 'success'
                                                        : task.status === 'in-progress'
                                                            ? 'warning'
                                                            : 'default'
                                                }
                                                onClick={(e) => handleStatusClick(e, task)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleDeleteClick(task)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredTasks.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Status Change Menu */}
            <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusClose}
            >
                <MenuItem onClick={() => handleStatusChange('pending')}>Pending</MenuItem>
                <MenuItem onClick={() => handleStatusChange('in-progress')}>In Progress</MenuItem>
                <MenuItem onClick={() => handleStatusChange('completed')}>Completed</MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteClose}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this task assigned to {taskToDelete && getAgentName(taskToDelete.assignedAgent)}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskList; 