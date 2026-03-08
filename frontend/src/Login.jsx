import { supabase } from "../supabaseClient";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // JWT is stored internally by Supabase client
    alert("Login success");

    // Sync user to backend
    if (data.user) {
      const session = data.session;
      const role = email === 'rohith@corideadmin.com' ? 'ADMIN' : 'RIDER'; // Default to rider or fetch from metadata if available

      try {
        await fetch('http://localhost:8080/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            id: data.user.id,
            email: email,
            name: 'Admin User', // Default name
            role: role
          })
        });
        console.log("User synced to backend");
      } catch (err) {
        console.error("Sync failed", err);
      }
    }
  };

  return (
    <>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </>
  );
}

export default Login;
