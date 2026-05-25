import logo from '../assets/Artboard 1@3x.png';
import { Link } from 'react-router-dom';

export default function Footer(){
    
    return (
        <>
            <footer className="footer">
                <div className="footerInner">
                    <div className="footerCol">
                        <div className="footerBrand">Studylance</div>
                        <div className="footerText">
                            Простая доска заданий для студентов и исполнителей. Опубликуйте задачу, укажите бюджет и получите результат.
                        </div>
                    </div>

                    <div className="footerCol">
                        <div className="footerHeading">Навигация</div>
                        <Link className="footerLink" to="/posts">Смотреть задания</Link>
                        <Link className="footerLink" to="/signup">Создать аккаунт</Link>
                        <Link className="footerLink" to="/signin">Войти</Link>
                    </div>

                    <div className="footerCol">
                        <div className="footerHeading">Информация</div>
                        <span className="footerLink">FAQ (скоро)</span>
                        <span className="footerLink">Безопасность (скоро)</span>
                        <span className="footerLink">Контакты (скоро)</span>
                    </div>

                    <img src={logo} height="64" className='footerLogo' alt="Логотип Studylance" />
                </div>
            </footer>
        </>
    )
}
