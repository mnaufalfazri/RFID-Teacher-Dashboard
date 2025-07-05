// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    return {
      token,
      user: JSON.parse(user)
    };
  } catch (error) {
    console.error('Error parsing user data', error);
    return false;
  }
};

// Logout function
export const logout = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
