import { useEffect, useState } from "react";
import "./atm.css"
import { useNavigate } from "react-router-dom";
import { icons } from "../assets/assets";

const atm = () => {

    const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState<number | string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<number | string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token"); //sprawdzam czy użytk jest auth
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
    <div className="atm">
        
        <div className="main_pic">
            <img className="main_pic_jpg" src={icons.Cool_Atm} alt="" />
        </div>

        <div className="greet">
            <h1>👋😀 Siema, {userData?.username}!</h1>
            <br />
            <p className="info_money">Na swoim koncie masz <b className="exeption">${balance}</b>. Wpłacamy czy wypłacamy pieniądze?</p>
            <br />
        </div>

        <div className="money_operations">
            <div>
                <form className="withdraw_deposit" action="">
                    <img className="money_op" src={icons.Request} alt="" />
                    <br />
                    <h3>Wpłata Środków</h3>
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        placeholder="Kwota do wpłaty"
                    />
                    <br />
                    <button className="BtnMoney" onClick={handleDeposit}>Wpłacić</button>
                </form>
            </div>

            <div>
                <form className="withdraw_deposit" action="">
                    <img className="money_op" src={icons.Send} alt="" />
                    <br />
                    <h3>Wypłata Środków</h3>
                    <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        placeholder="Kwota do wypłaty"/>
                        <br />
                    <button className="BtnMoney" onClick={handleWithdraw}>Wypłacić</button>
                    
                    
                </form>
            </div>
        </div>

    </div>
  )
}

export default atm