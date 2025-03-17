import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { icons } from '../assets/assets';
import './sidebar.css';

const Sidebar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
    const navigate = useNavigate();

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };

        window.addEventListener("storage", handleStorageChange); 

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/");
    };

    return (
        <div className='sidebar_block'>
            <div className="content">
                <div className='greeting'>
                    <div className='logo'>
                        <h2><img src={icons.Logo} alt="" /> Twój Bank</h2>
                    </div>
                    <div>
                        <img src={icons.BurgerBtn} alt="" />
                    </div>
                </div>

                <div>
                    <ul className='navigacja'>
                        {!isAuthenticated ? (
                            <>
                                <li>
                                    <Link to="/register" className="full-link">
                                        <img className='logs' src={icons.Register} alt="" />
                                        Rejestracja
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/" className="full-link">
                                        <img className='logs' src={icons.Login} alt="" />
                                        Logowanie
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button className="full-link full-link_btn" onClick={handleLogout}>
                                    <img className='logs' src={icons.Logout} alt="" />
                                    Wyloguj się
                                </button>
                            </li>
                        )}

                        <li>
                            <Link to={isAuthenticated ? "/dashboard" : "/notlogged"} className="full-link">
                                <img className='logs' src={icons.Transactions} alt="" />
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to={isAuthenticated ? "/atm" : "/notlogged"} className="full-link">
                                <img className='logs' src={icons.Atm} alt="" />
                                ATM
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <ul className='navigacja footer'>
                <li>
                    <img className='logs' src={icons.Settings} alt="" />
                    <h3>Ustawienia</h3>
                </li>

                <hr />

                <li>
                    <img className='logs' src={icons.User} alt="" />
                    <h3>Konto</h3>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
