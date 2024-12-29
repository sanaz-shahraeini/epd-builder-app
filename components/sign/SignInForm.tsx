"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Tabs,
  Tab,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signIn } from "next-auth/react";

interface SignInFormProps {
  open: boolean;
  onClose: () => void;
  setShowSignIn: (show: boolean) => void;
  setShowSignUp: (show: boolean) => void;
  setShowForgotPassword: (show: boolean) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SignInResponse {
  message?: string;
  error?: string;
  access_token: string;
  refresh_token: string;
  user: any;
}

interface Message {
  text: string;
  type: "success" | "error";
}

const validationSchema = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SignInForm: React.FC<SignInFormProps> = ({
  open,
  onClose,
  setShowSignIn,
  setShowSignUp,
  setShowForgotPassword,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage(null);
  };

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  const handleSignIn = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:8000/users/signin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          userType: tabValue === 0 ? "regular" : "company",
        }),
      });

      const data: SignInResponse = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "Sign in successful",
          type: "success",
        });
        // Store tokens
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage({ text: data.error || "Sign in failed", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: handleSignIn,
  });

  const handleSignUpClick = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="sign-in-modal"
        aria-describedby="sign-in-form"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 450,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            p: 4,
            color: "#1B4242",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 600,
              background: "linear-gradient(45deg, #42B7B0, #1B4242)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome Back
          </Typography>

          {message && (
            <Alert
              severity={message.type}
              sx={{
                mb: 3,
                borderRadius: 1.5,
                "& .MuiAlert-icon": {
                  fontSize: "1.5rem",
                },
              }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          <Paper
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                ".MuiTab-root": {
                  color: "#666",
                  textTransform: "none",
                  fontSize: "1rem",
                  py: 2,
                  "&.Mui-selected": {
                    color: "#42B7B0",
                    fontWeight: 600,
                  },
                },
                ".MuiTabs-indicator": {
                  backgroundColor: "#42B7B0",
                  height: 3,
                },
              }}
            >
              <Tab label="Regular User" />
              <Tab label="Company User" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <form onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&:hover fieldset": {
                        borderColor: "#42B7B0",
                      },
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#42B7B0 !important",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#42B7B0",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&:hover fieldset": {
                        borderColor: "#42B7B0",
                      },
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#42B7B0 !important",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#42B7B0",
                    },
                  }}
                />

                <Box sx={{ textAlign: "right", mb: 2 }}>
                  <Typography
                    variant="body2"
                    component="button"
                    onClick={() => setShowForgotPassword(true)}
                    sx={{
                      background: "none",
                      border: "none",
                      color: "#42B7B0",
                      cursor: "pointer",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#1B4242",
                      },
                      padding: 0,
                      font: "inherit",
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "linear-gradient(45deg, #42B7B0, #3AA19B)",
                    boxShadow: "0 4px 12px rgba(66, 183, 176, 0.2)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #3AA19B, #1B4242)",
                      boxShadow: "0 6px 16px rgba(66, 183, 176, 0.3)",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#A5D3D1",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <form onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&:hover fieldset": {
                        borderColor: "#42B7B0",
                      },
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#42B7B0 !important",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#42B7B0",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&:hover fieldset": {
                        borderColor: "#42B7B0",
                      },
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#42B7B0 !important",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#42B7B0",
                    },
                  }}
                />

                <Box sx={{ textAlign: "right", mb: 2 }}>
                  <Typography
                    variant="body2"
                    component="button"
                    onClick={() => setShowForgotPassword(true)}
                    sx={{
                      background: "none",
                      border: "none",
                      color: "#42B7B0",
                      cursor: "pointer",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#1B4242",
                      },
                      padding: 0,
                      font: "inherit",
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "linear-gradient(45deg, #42B7B0, #3AA19B)",
                    boxShadow: "0 4px 12px rgba(66, 183, 176, 0.2)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #3AA19B, #1B4242)",
                      boxShadow: "0 6px 16px rgba(66, 183, 176, 0.3)",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#A5D3D1",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>
            </TabPanel>

            <Divider sx={{ my: 2 }} />

            {tabValue === 0 && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  bgcolor: "#fff",
                  color: "#42B7B0",
                  borderColor: "#42B7B0",
                  borderWidth: "2px",
                  "&:hover": {
                    bgcolor: "rgba(66, 183, 176, 0.05)",
                    borderColor: "#3AA19B",
                    borderWidth: "2px",
                  },
                  mb: 2,
                }}
              >
                Log in with Google
              </Button>
            )}

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Button
                  onClick={handleSignUpClick}
                  sx={{
                    padding: "4px 8px",
                    fontSize: "inherit",
                    color: "#42B7B0",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      color: "#3AA19B",
                      background: "rgba(66, 183, 176, 0.05)",
                    },
                  }}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </>
  );
};

export default SignInForm;
