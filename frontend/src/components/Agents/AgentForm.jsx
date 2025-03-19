import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Common country codes
const COUNTRY_CODES = [
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+34', country: 'Spain' },
    { code: '+39', country: 'Italy' },
    { code: '+7', country: 'Russia' },
    { code: '+55', country: 'Brazil' },
    { code: '+52', country: 'Mexico' },
    { code: '+65', country: 'Singapore' },
    { code: '+971', country: 'UAE' },
];

const AgentForm = ({ agent, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+1',
        mobileNumber: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (agent) {
            setFormData({
                name: agent.name || '',
                email: agent.email || '',
                countryCode: agent.countryCode || '+1',
                mobileNumber: agent.mobileNumber || '',
                password: '',
            });
        }
    }, [agent]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.countryCode.trim()) {
            newErrors.countryCode = 'Country code is required';
        } else if (!/^\+\d{1,4}$/.test(formData.countryCode)) {
            newErrors.countryCode = 'Invalid country code format (e.g., +1)';
        }

        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^\d{1,14}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Invalid mobile number format';
        }

        if (!agent && !formData.password) {
            newErrors.password = 'Password is required';
        } else if (!agent && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Only include password in submission if it's provided or it's a new agent
            const submitData = {
                ...formData,
                password: formData.password || undefined,
            };
            onSubmit(submitData);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                autoComplete="name"
            />
            <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="email"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl
                    margin="normal"
                    error={!!errors.countryCode}
                    sx={{ minWidth: 200 }}
                >
                    <InputLabel>Country Code</InputLabel>
                    <Select
                        value={formData.countryCode}
                        name="countryCode"
                        label="Country Code"
                        onChange={handleChange}
                        autoComplete="tel-country-code"
                    >
                        {COUNTRY_CODES.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                                {country.code} ({country.country})
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.countryCode && (
                        <FormHelperText>{errors.countryCode}</FormHelperText>
                    )}
                </FormControl>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Mobile Number"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber}
                    placeholder="1234567890"
                    autoComplete="tel"
                />
            </Box>
            <TextField
                margin="normal"
                fullWidth
                label={agent ? 'New Password (optional)' : 'Password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required={!agent}
                autoComplete={agent ? "new-password" : "current-password"}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="contained">
                    {agent ? 'Update' : 'Create'} Agent
                </Button>
            </Box>
        </Box>
    );
};

export default AgentForm; 