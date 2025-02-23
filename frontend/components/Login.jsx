import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div>
      <h1>Sign In with Google</h1>
      <button onClick={handleGoogleLogin}>Sign In with Google</button>
    </div>
  );
};

export default Login;