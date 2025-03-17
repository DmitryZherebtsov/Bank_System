import { icons } from '../assets/assets'
import './notlogged.css'

const notlogged = () => {
  return (
    <div className='not_logged'>
        <img className='not_logged_img' src={icons.Locked} alt="" />
        <br />
        <h2>Nie Jesteś Zalogowany!</h2>
    </div>
  )
}

export default notlogged
