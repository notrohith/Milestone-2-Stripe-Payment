import { supabase } from "../supabaseClient";
import { useState } from "react";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RIDER");

  const signup = async () => {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // 2. Insert metadata into users table
    await supabase.from("users").insert({
      id: data.user.id,
      email,
      role,
    });

    alert("Signup successful");
  };

  return (
    <>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />

      <select onChange={e => setRole(e.target.value)}>
        <option value="RIDER">Rider</option>
        <option value="DRIVER">Driver</option>
      </select>

      <button onClick={signup}>Sign up</button>
    </>
  );
}

export default Signup;
