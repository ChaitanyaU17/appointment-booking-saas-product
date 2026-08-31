import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'select' | 'multiline';
  options?: { label: string; value: string | number }[];
  rows?: number;
}

export interface DynamicFormProps {
  fields: FieldConfig[];
  initialValues: any;
  validationSchema?: any;
  onSubmit: (values: any, formikHelpers: any) => void;
  submitLabel?: string;
  isLoading?: boolean;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export default function DynamicForm({
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  submitLabel = 'Submit',
  isLoading = false,
  onCancel,
  children
}: DynamicFormProps) {
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      {fields.map((field) => {
        const isSelect = field.type === 'select';
        const isPasswordField = field.type === 'password';
        const isVisible = showPassword[field.name];

        return (
          <TextField
            key={field.name}
            fullWidth
            margin="normal"
            id={field.name}
            name={field.name}
            label={field.label}
            type={isPasswordField ? (isVisible ? 'text' : 'password') : (isSelect || field.type === 'multiline' ? 'text' : field.type || 'text')}
            select={isSelect}
            multiline={field.type === 'multiline'}
            rows={field.rows || 3}
            value={formik.values[field.name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
            helperText={formik.touched[field.name] && formik.errors[field.name] as string}
            slotProps={{
              input: {
                sx: { borderRadius: '10px' },
                ...(isPasswordField && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility(field.name)} edge="end">
                        {isVisible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }),
              }
            }}
          >
            {isSelect && field.options && field.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      })}

      {children}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={isLoading} sx={{ borderRadius: '6px' }}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isLoading || formik.isSubmitting}
          sx={{ borderRadius: '6px', px: 4 }}
        >
          {isLoading || formik.isSubmitting ? <CircularProgress size={24} /> : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
