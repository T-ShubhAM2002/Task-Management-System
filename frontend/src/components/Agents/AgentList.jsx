import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { agentService } from '../../services/api';
import { toast } from 'react-toastify';
import AgentForm from './AgentForm';

const AgentList = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const data = await agentService.getAgents();
            setAgents(data);
        } catch (error) {
            toast.error('Failed to fetch agents', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (agent = null) => {
        setSelectedAgent(agent);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setSelectedAgent(null);
        setOpenDialog(false);
    };

    const handleOpenDeleteConfirm = (agent) => {
        setAgentToDelete(agent);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setAgentToDelete(null);
        setDeleteConfirmOpen(false);
    };

    const handleSaveAgent = async (agentData) => {
        try {
            if (selectedAgent) {
                await agentService.updateAgent(selectedAgent._id, agentData);
                toast.success('Agent updated successfully');
            } else {
                await agentService.createAgent(agentData);
                toast.success('Agent created successfully');
            }
            fetchAgents();
            handleCloseDialog();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save agent');
        }
    };

    const handleDeleteAgent = async () => {
        try {
            const response = await agentService.deleteAgent(agentToDelete._id);
            const message = response.reassignedTasks > 0
                ? `Agent deleted successfully. ${response.reassignedTasks} tasks were redistributed to remaining agents.`
                : 'Agent deleted successfully.';
            toast.success(message);
            fetchAgents();
            handleCloseDeleteConfirm();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete agent';
            toast.error(errorMessage);
            handleCloseDeleteConfirm();
        }
    };

    if (loading) {
        return <Typography>Loading agents...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Agent Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Agent
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Mobile Number</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {agents.map((agent) => (
                            <TableRow key={agent._id}>
                                <TableCell>{agent.name}</TableCell>
                                <TableCell>{agent.email}</TableCell>
                                <TableCell>{agent.countryCode} {agent.mobileNumber}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenDialog(agent)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpenDeleteConfirm(agent)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Agent Form Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedAgent ? 'Edit Agent' : 'Add New Agent'}
                </DialogTitle>
                <DialogContent>
                    <AgentForm
                        agent={selectedAgent}
                        onSubmit={handleSaveAgent}
                        onCancel={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {agentToDelete?.name}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
                    <Button onClick={handleDeleteAgent} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AgentList; 