import { useEffect, useState } from "react";
import axios from "axios";
import AuthService from "@/services/AuthService";

export default function GetUsers() {
  console.log("aqui")
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AuthService.userList();
        console.log(response);

        setUsers(response.data);
        console.log(users);

      } catch (err) {
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return users;
}

// import { apiClient } from "@/libs/api";

// async function getUsers() {
//   return apiClient.get("/detalhes-usuario/").then((response) => response.data);
// }

// export default {
//   getUsers,
// };
