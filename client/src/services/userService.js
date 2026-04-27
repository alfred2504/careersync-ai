import axios from "axios";

export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};