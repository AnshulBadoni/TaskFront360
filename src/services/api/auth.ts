
type SignupPayload = {
    username: string;
    email: string;
    password: string;
    compcode: string;
    role?: string;
    avatar?: string;
  };

  type SigninPayload = {
    email: string;
    password: string;
  };


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/auth" || "http://192.168.0.185:3001/auth";

  export const signup = async (payload: SignupPayload) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  };

  /**
   * Authenticates a user and returns a JWT token, which is set as an HTTP-only
   * cookie on the client.
   *
   * @param {object} payload - { email, password }
   * @returns {Promise<object>} - User object with JWT token
   * @throws {Error} - If API call fails or response is invalid
   */
  export const signin = async (payload: SigninPayload) => {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  };
