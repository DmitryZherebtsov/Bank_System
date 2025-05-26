import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminPanel.css";

interface LastTransaction {
  amount: number;
  type: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  last_transaction?: LastTransaction;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const meRes = await fetch("http://127.0.0.1:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.ok) {
          const me = await meRes.json();
          setUserData(me);

          if (me.email !== "admin@gmail.com") {
            navigate("/dashboard");
            return;
          }

          const usersRes = await fetch("http://127.0.0.1:8000/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (usersRes.ok) {
            const allUsers = await usersRes.json();
            setUsers(allUsers);
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchData();
  }, [navigate]);

  if (!userData || userData.email !== "admin@gmail.com") return null;

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Email</th>
            <th>Saldo</th>
            <th>Ostatnia transakcja</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.balance}</td>
              <td>
                {u.last_transaction
                  ? `${u.last_transaction.type} ${u.last_transaction.amount} (${new Date(u.last_transaction.timestamp).toLocaleString()})`
                  : "Brak transakcji"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
