const API_BASE_URL = 'http://localhost:8000';

export interface SignUpData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  company_name: string;
  job_title: string;
  phone_number?: string;
  industry?: string;
  country?: string;
  user_type: 'regular' | 'company';
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
      company_name: data.company_name,
      job_title: data.job_title,
      phone_number: data.phone_number,
      industry: data.industry,
      country: data.country,
      user_type: data.user_type
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
