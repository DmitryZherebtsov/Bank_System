import { Link } from 'react-router-dom'
import './sidebar.css'
import { icons } from '../assets/assets'

const sidebar = () => {
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
                    <li>
                        <Link to="./register" className="full-link">
                            <img className='logs' src={icons.Register} alt="" />
                            Rejestracja
                        </Link>
                    </li>

                    <li>
                        <Link to="./" className="full-link">
                            <img className='logs' src={icons.Login} alt="" />
                            Logowanie
                        </Link>
                    </li>

                    <li>
                        <Link to="./dashboard" className="full-link">
                            <img className='logs' src={icons.Transactions} alt="" />
                            Dashboard
                        </Link>
                    </li>
                </ul>
            </div>
        </div>


        <ul className='navigacja footer'>
            <li>
                <img className='logs' src={icons.Settings} alt="" />
                Settings
            </li>

            <hr />

            <li>
                <img className='logs' src={icons.User} alt="" />
                Name
            </li>
        </ul>

    </div>
  )
}

export default sidebar