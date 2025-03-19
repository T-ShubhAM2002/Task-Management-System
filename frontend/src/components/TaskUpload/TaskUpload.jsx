import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemText,
    Collapse,
    IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { taskService } from '../../services/api';
import { toast } from 'react-toastify';

const TaskUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        errors: false,
        warnings: false,
        failedRecords: false,
        distribution: false
    });

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
                toast.error('File size must not exceed 10MB');
                return;
            }
            const fileType = selectedFile.type;
            const validTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            if (!validTypes.includes(fileType)) {
                toast.error('Please upload a CSV or Excel file');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await taskService.uploadTasks(formData);
            setUploadResult(response);

            if (response.success) {
                toast.success('Tasks uploaded successfully');
                if (response.warnings?.length > 0) {
                    toast.warning('Upload completed with warnings');
                }
            } else {
                toast.error('Failed to upload tasks');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading tasks: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderExpandableSection = (title, content, section) => (
        <Box sx={{ mt: 2 }}>
            <Button
                onClick={() => toggleSection(section)}
                endIcon={expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mb: 1 }}
            >
                {title}
            </Button>
            <Collapse in={expandedSections[section]}>
                {content}
            </Collapse>
        </Box>
    );

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Upload Tasks
            </Typography>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <input
                    accept=".csv,.xlsx,.xls"
                    style={{ display: 'none' }}
                    id="task-file-upload"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="task-file-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={loading}
                    >
                        Select File
                    </Button>
                </label>

                {file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected file: {file.name}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    sx={{ mt: 2, ml: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
            </Box>

            {uploadResult && (
                <Box sx={{ mt: 4 }}>
                    {uploadResult.success ? (
                        <Alert severity="success">
                            <AlertTitle>Success</AlertTitle>
                            Successfully uploaded {uploadResult.taskCount} tasks
                        </Alert>
                    ) : (
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            {uploadResult.errors?.[0] || 'Failed to upload tasks'}
                        </Alert>
                    )}

                    {uploadResult.warnings?.length > 0 && renderExpandableSection(
                        `Warnings (${uploadResult.warnings.length})`,
                        <List>
                            {uploadResult.warnings.map((warning, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={warning} />
                                </ListItem>
                            ))}
                        </List>,
                        'warnings'
                    )}

                    {uploadResult.failedRecords?.length > 0 && renderExpandableSection(
                        `Failed Records (${uploadResult.failedRecords.length})`,
                        <List>
                            {uploadResult.failedRecords.map((record, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`Row ${record.rowNumber}`}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="error">
                                                    Errors: {record.errors.join(', ')}
                                                </Typography>
                                                <br />
                                                <Typography component="span" variant="body2">
                                                    Data: {JSON.stringify(record.data)}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>,
                        'failedRecords'
                    )}

                    {uploadResult.distribution && renderExpandableSection(
                        'Distribution Metrics',
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Total Tasks"
                                    secondary={uploadResult.distribution.totalTasks}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Base Tasks Per Agent"
                                    secondary={uploadResult.distribution.baseTasksPerAgent}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Average Tasks Per Agent"
                                    secondary={uploadResult.distribution.averageTasksPerAgent.toFixed(2)}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Workload Variance"
                                    secondary={uploadResult.distribution.workloadVariance.toFixed(2)}
                                />
                            </ListItem>
                        </List>,
                        'distribution'
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default TaskUpload; 