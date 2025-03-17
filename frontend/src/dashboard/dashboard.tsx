import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { icons } from "../assets/assets";
import "./dashboard.css"

const Dashboard = () => {
    const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState<number | string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<number | string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const userResponse = await fetch("http://127.0.0.1:8000/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserData(userData);
                } else {
                    navigate("/login");
                    return;
                }

                // Отримуємо баланс користувача
                const balanceResponse = await fetch("http://127.0.0.1:8000/account/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (balanceResponse.ok) {
                    const accountData = await balanceResponse.json();
                    setBalance(accountData.balance);
                } else {
                    console.error("Error fetching account balance:", await balanceResponse.text());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleDeposit = async () => {
        const token = localStorage.getItem("token");
        if (!token || !depositAmount) return;
    
        try {
            const response = await fetch("http://127.0.0.1:8000/account/deposit/", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: depositAmount }),
            });
    
            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance);  
                setDepositAmount(''); 
            } else {
                console.error("Error depositing:", await response.text());
            }
        } catch (error) {
            console.error("Error depositing:", error);
        }
    };
    
    const handleWithdraw = async () => {
        const token = localStorage.getItem("token");
        if (!token || !withdrawAmount) return;
    
        try {
            const response = await fetch("http://127.0.0.1:8000/account/withdraw/", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: withdrawAmount }),
            });
    
            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance);
                setWithdrawAmount(''); 
            } else {
                console.error("Error withdrawing:", await response.text());
            }
        } catch (error) {
            console.error("Error withdrawing:", error);
        }
    };

    return (
        <div>

            <div className="info_icons">
                <div>
                    <img src={icons.Inbox}  alt="" />
                    <img src={icons.Scale}  alt="" />
                </div>
                <div>
                    <img src={icons.Question} alt="" />
                </div>
            </div>

            <h1>Welcome, {userData?.username}</h1>
            <p>Email: {userData?.email}</p>
            <p>Balance: ${balance}</p>

            <div>
                <h3>Deposit</h3>
                <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    placeholder="Amount to deposit"
                />
                <button onClick={handleDeposit}>Deposit</button>
            </div>

            <div>
                <h3>Withdraw</h3>
                <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    placeholder="Amount to withdraw"
                />
                <button onClick={handleWithdraw}>Withdraw</button>
            </div>
        </div>
    );
};

export default Dashboard;
