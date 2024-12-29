'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface VerifyCodeFormProps {
  email: string;
  onSuccess: (code: string) => void;
  onClose: () => void;
}

const VerifyCodeForm = ({ email, onSuccess, onClose }: VerifyCodeFormProps) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      code: '',
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .length(6, 'Verification code must be 6 digits')
        .matches(/^\d+$/, 'Verification code must only contain numbers')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/users/password-reset/validate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: values.code,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          onSuccess(values.code);
        } else {
          toast.error(data.message || 'Invalid verification code');
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        width: '90%',
        maxWidth: 400,
        bgcolor: '#fff',
        borderRadius: 1,
        p: 4,
        color: '#1B4242',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#5C8374',
          '&:hover': {
            color: '#1B4242',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography
        variant="h5"
        component="h2"
        align="center"
        sx={{ mb: 3, color: '#1B4242' }}
      >
        Verify Code
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{ mb: 4, color: '#5C8374' }}
      >
        Enter the 6-digit code sent to {email}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="code"
          name="code"
          label="Verification Code"
          value={formik.values.code}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
          required
          variant="outlined"
          inputProps={{
            maxLength: 6,
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              color: '#1B4242',
              '& fieldset': {
                borderColor: '#5C8374',
              },
              '&:hover fieldset': {
                borderColor: '#1B4242',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1B4242',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#5C8374',
            },
            '& .MuiFormHelperText-root': {
              color: '#f44336',
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || !formik.isValid}
          sx={{
            bgcolor: '#42B7B0',
            color: '#fff',
            '&:hover': {
              bgcolor: '#3AA19B',
            },
            '&.Mui-disabled': {
              bgcolor: '#A5D3D1',
            },
            '&.Mui-disabled:hover': {
              bgcolor: '#A5D3D1',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
        </Button>
      </form>
    </Box>
  );
};

export default VerifyCodeForm;
