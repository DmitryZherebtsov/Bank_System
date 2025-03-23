// Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { icons } from "../assets/assets";
import "./dashboard.css"

const Dashboard = () => {
    const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
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

                const balanceResponse = await fetch("http://127.0.0.1:8000/account/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (balanceResponse.ok) {
                    const accountData = await balanceResponse.json();
                    setBalance(accountData.balance);
                }

                const transactionsResponse = await fetch("http://127.0.0.1:8000/transactions/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (transactionsResponse.ok) {
                    const transactionsData = await transactionsResponse.json();
                    setTransactions(transactionsData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, [navigate]);

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



                <div className="personal_dashboard">

                    <div>
                        <h1>Mój portfel</h1>
                        <br />
                        <p> Monitoruj swój plan finansowy!</p>
                        <br />
                        <p> <b>Email:</b> <i>{userData?.email}</i> </p>
                        <br />
                        <hr />
                        <br />

                    </div>

                    <div className="personal_info">
                        <div className="card">
                            <div className="card_info">
                                <h4>👋 Cześć {userData?.username}</h4>
                                <div> <img className="icon_dots" src={icons.Dots} alt="" /></div>
                            </div>
                            <br />
                            <div className="card_info_balance">
                                <p>Balance:</p>
                                <h3> ${balance}</h3>
                            </div>
                        </div>
                    </div>

                </div>


                <div className="transactions">
                    <h3>Transaction History</h3>
                    <ul>
                    {transactions.map((transaction, index) => (
                        <li key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {transaction.type === "deposit" ? (
                                <img className="m_operation" src={icons.Deposit} />
                            ) : (
                                <img className="m_operation" src={icons.Withdraw} />
                            )}
                            
                            <p>{transaction.type} of <b>${transaction.amount}</b> on {transaction.timestamp}</p>
                        </li>
                    ))}
                    </ul>
                </div>
            
        </div>
    );
};

export default Dashboard;
