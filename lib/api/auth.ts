const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SignUpData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  company_name?: string;
  job_title?: string;
  phone_number?: string;
  industry?: string;
  country?: string;
  user_type: 'regular' | 'company';
}

// Profile interface
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'regular' | 'company' | 'admin';
  company_name?: string;
  job_title?: string;
  industry?: string;
  country?: string;
  phone_number?: string;
  profile?: {
    bio?: string;
    profile_picture?: string;
  };
}

export async function checkUsername(username: string): Promise<boolean> {
  try {
    console.log('Checking username:', username);
    const url = `${API_BASE_URL}/users/check-username/${username}/`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    // Log the raw response text
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse it as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return false;
    }
    
    if (!response.ok) {
      console.error('Username check failed:', response.status, response.statusText);
      return false;
    }

    // The API returns {exists: false} when username is available
    const isAvailable = !data.exists;
    console.log('Username availability result:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}

export async function checkEmail(email: string): Promise<boolean> {
  try {
    console.log('Checking email:', email);
    const url = `${API_BASE_URL}/users/check-email/${email}/`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    // Log the raw response text
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse it as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return false;
    }
    
    if (!response.ok) {
      console.error('Email check failed:', response.status, response.statusText);
      return false;
    }

    // The API returns {exists: false} when email is available
    const isAvailable = !data.exists;
    console.log('Email availability result:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

export async function signUp(data: SignUpData): Promise<any> {
  try {
    // Log the complete data being sent
    const requestData = {
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      email: data.email,
      password: data.password,
      user_type: data.user_type,
      ...(data.company_name && { company_name: data.company_name }),
      ...(data.job_title && { job_title: data.job_title }),
      ...(data.phone_number && { phone_number: data.phone_number }),
      ...(data.industry && { industry: data.industry }),
      ...(data.country && { country: data.country })
    };
    
    console.log('Full signup request data:', {
      ...requestData,
      password: '***hidden***'
    });
    
    const response = await fetch(`${API_BASE_URL}/users/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    const responseText = await response.text();
    console.log('Raw signup response:', responseText);
    
    if (!response.ok) {
      let errorMessage = 'Signup failed';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }
    
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('Parsed signup response:', jsonResponse);
      return jsonResponse;
    } catch (e) {
      console.error('Failed to parse success response:', e);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
}

export async function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    console.log('Current session:', session); // Log the current session
    if (!session) {
      localStorage.removeItem('session');
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

import { getSession as getNextAuthSession } from 'next-auth/react'

// Get user profile
export async function getUserProfile(): Promise<UserProfile> {
  const session = await getNextAuthSession()
  
  if (!session?.accessToken) {
    throw new Error('Not authenticated')
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/profile/`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired')
      }
      throw new Error('Failed to fetch profile')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(data: Partial<UserProfile>) {
  const session = await getNextAuthSession()
  console.log('Session in updateUserProfile:', session)
  
  if (!session?.accessToken) {
    console.error('No access token in session')
    throw new Error('Not authenticated')
  }

  const formData = new FormData()
  
  // Handle file upload
  if (data.profile_picture instanceof File) {
    console.log('Appending profile picture to form data')
    formData.append('profile_picture', data.profile_picture)
  }
  
  // Handle other fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'profile_picture' && value !== undefined) {
      console.log(`Appending ${key} to form data:`, value)
      formData.append(key, value.toString())
    }
  })

  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/profile/`
  console.log('Updating profile at:', url)

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        // Don't set Content-Type header when using FormData
      },
      body: formData
    })
    
    console.log('Update response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Profile update error:', response.status, errorText)
      throw new Error('Failed to update profile')
    }

    const updatedProfile = await response.json()
    console.log('Updated profile data:', updatedProfile)
    return updatedProfile
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}
