import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { taskService, agentService } from '../../services/api';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';

const TaskUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [preview, setPreview] = useState([]);
    const [error, setError] = useState(null);
    const [autoDistribute, setAutoDistribute] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const data = await agentService.getAgents();
            setAgents(data);
        } catch (error) {
            toast.error('Failed to fetch agents: ' + error.message);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            const validTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (!validTypes.includes(fileType) &&
                !selectedFile.name.endsWith('.csv') &&
                !selectedFile.name.endsWith('.xlsx') &&
                !selectedFile.name.endsWith('.xls')) {
                setError('Please upload a CSV or Excel file');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            previewFile(selectedFile);
        }
    };

    const previewFile = async (file) => {
        try {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                previewCSV(file);
            } else {
                await previewExcel(file);
            }
        } catch (error) {
            setError('Error reading file: ' + error.message);
        }
    };

    const previewCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\\n');
            const headers = lines[0].split(',');
            const previewData = lines.slice(1, 6).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    obj[header.trim()] = values[index]?.trim();
                    return obj;
                }, {});
            });
            setPreview(previewData);
        };
        reader.readAsText(file);
    };

    const previewExcel = async (file) => {
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await file.arrayBuffer();

        try {
            if (file.name.endsWith('.xlsx')) {
                await workbook.xlsx.load(arrayBuffer);
            } else {
                await workbook.xls.load(arrayBuffer);
            }

            const worksheet = workbook.worksheets[0];
            const headers = [];
            const previewData = [];

            // Get headers from the first row
            worksheet.getRow(1).eachCell((cell) => {
                headers.push(cell.value);
            });

            // Get up to 5 rows of data
            for (let rowNumber = 2; rowNumber <= Math.min(6, worksheet.rowCount); rowNumber++) {
                const row = worksheet.getRow(rowNumber);
                const rowData = {};

                headers.forEach((header, index) => {
                    const cell = row.getCell(index + 1);
                    rowData[header] = cell.value?.toString() || '';
                });

                previewData.push(rowData);
            }

            setPreview(previewData);
        } catch (error) {
            throw new Error('Failed to read Excel file: ' + error.message);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }
        if (!autoDistribute && !selectedAgent) {
            setError('Please select an agent');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('autoDistribute', autoDistribute);
            if (!autoDistribute) {
                formData.append('agentId', selectedAgent);
            }

            await taskService.uploadTasks(formData);
            toast.success('Tasks uploaded and distributed successfully');
            setFile(null);
            setSelectedAgent('');
            setPreview([]);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload tasks');
            toast.error('Failed to upload tasks');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Upload Tasks
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Upload File
                        </Typography>
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                p: 3,
                                mb: 3,
                                textAlign: 'center',
                            }}
                        >
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="file-upload"
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Choose File
                                </Button>
                            </label>
                            {file && (
                                <Typography sx={{ mt: 2 }}>
                                    Selected file: {file.name}
                                </Typography>
                            )}
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoDistribute}
                                    onChange={(e) => setAutoDistribute(e.target.checked)}
                                />
                            }
                            label="Auto-distribute tasks among agents"
                            sx={{ mb: 2 }}
                        />

                        {!autoDistribute && (
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Assign to Agent</InputLabel>
                                <Select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    label="Assign to Agent"
                                >
                                    {agents.map((agent) => (
                                        <MenuItem key={agent._id} value={agent._id}>
                                            {agent.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={loading || !file || (!autoDistribute && !selectedAgent)}
                            fullWidth
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Upload and Distribute Tasks'
                            )}
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Preview
                        </Typography>
                        {preview.length > 0 ? (
                            <Box sx={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {Object.keys(preview[0]).map((header) => (
                                                <th
                                                    key={header}
                                                    style={{
                                                        padding: '8px',
                                                        borderBottom: '1px solid #ddd',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, index) => (
                                            <tr key={index}>
                                                {Object.values(row).map((value, i) => (
                                                    <td
                                                        key={i}
                                                        style={{
                                                            padding: '8px',
                                                            borderBottom: '1px solid #ddd',
                                                        }}
                                                    >
                                                        {value}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        ) : (
                            <Typography color="textSecondary">
                                Upload a file to see preview
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaskUpload; 