import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { agentService, taskService } from '../../services/api';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, loading }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}
    >
        <Box>
            <Typography variant="h6" color="textSecondary">
                {title}
            </Typography>
            <Typography variant="h4">
                {loading ? <CircularProgress size={20} /> : value}
            </Typography>
        </Box>
        <Box
            sx={{
                backgroundColor: 'primary.light',
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {icon}
        </Box>
    </Paper>
);

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalAgents: 0,
        totalTasks: 0,
        assignedTasks: 0,
        unassignedTasks: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [agentsResponse, tasksResponse] = await Promise.all([
                agentService.getAgents(),
                taskService.getTasks()
            ]);

            const tasks = tasksResponse.tasks || [];
            const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];

            setStats({
                totalAgents: agents.length,
                totalTasks: tasks.length,
                assignedTasks: tasks.filter(task => task.assignedAgent).length,
                unassignedTasks: tasks.filter(task => !task.assignedAgent).length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Add New Agent',
            description: 'Create a new agent account',
            icon: <PeopleIcon />,
            action: () => navigate('/dashboard/agents'),
        },
        {
            title: 'Upload Tasks',
            description: 'Upload and distribute new tasks',
            icon: <CloudUploadIcon />,
            action: () => navigate('/dashboard/upload'),
        },
        {
            title: 'View All Tasks',
            description: 'See all tasks and their status',
            icon: <AssignmentIcon />,
            action: () => navigate('/dashboard/tasks'),
        },
    ];

    return (
        <Box
            sx={{
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: 3
            }}
        >
            <Typography variant="h4" sx={{ mb: 6, textAlign: 'left', alignSelf: 'flex-start' }}>
                Dashboard Overview
            </Typography>

            {/* Statistics */}
            <Grid
                container
                spacing={4}
                sx={{
                    mb: 6,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    width: '100%'
                }}
            >
                <Grid item xs={12} sm={6}>
                    <StatCard
                        title="Total Agents"
                        value={
                            <Box>
                                <Typography variant="h4">{stats.totalAgents}</Typography>
                                <Box sx={{ mt: 1, height: '24px' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Active Agents
                                    </Typography>
                                </Box>
                            </Box>
                        }
                        icon={<PeopleIcon />}
                        loading={loading}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <StatCard
                        title="Total Tasks"
                        value={
                            <Box>
                                <Typography variant="h4">{stats.totalTasks}</Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Assigned: {stats.assignedTasks}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Unassigned: {stats.unassignedTasks}
                                    </Typography>
                                </Box>
                            </Box>
                        }
                        icon={<AssignmentIcon />}
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h4" sx={{ mb: 6, textAlign: 'left', alignSelf: 'flex-start' }}>
                Quick Actions
            </Typography>
            <Grid
                container
                spacing={3}
                sx={{
                    justifyContent: 'center',
                    maxWidth: '1000px'
                }}
            >
                {quickActions.map((action) => (
                    <Grid item xs={12} sm={6} md={4} key={action.title}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                            onClick={action.action}
                        >
                            <Box
                                sx={{
                                    backgroundColor: 'primary.light',
                                    borderRadius: '50%',
                                    p: 2,
                                    mb: 2,
                                }}
                            >
                                {action.icon}
                            </Box>
                            <Typography variant="h6" gutterBottom>
                                {action.title}
                            </Typography>
                            <Typography color="textSecondary">
                                {action.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DashboardOverview; 
