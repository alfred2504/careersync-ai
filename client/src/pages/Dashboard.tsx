import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";

type UserProfile = {
  name?: string;
  email?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (error) {
        window.location.href = "/login";
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1>Welcome, {user.name} 👋</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}