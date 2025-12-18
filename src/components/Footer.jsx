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
                            A lightweight task board for students and solvers. Post an assignment, set a budget, and get it done.
                        </div>
                    </div>

                    <div className="footerCol">
                        <div className="footerHeading">Explore</div>
                        <Link className="footerLink" to="/posts">Browse tasks</Link>
                        <Link className="footerLink" to="/signup">Create account</Link>
                        <Link className="footerLink" to="/signin">Sign in</Link>
                    </div>

                    <div className="footerCol">
                        <div className="footerHeading">Info</div>
                        <span className="footerLink">FAQ (soon)</span>
                        <span className="footerLink">Safety (soon)</span>
                        <span className="footerLink">Contact (soon)</span>
                    </div>

                    <img src={logo} height="64" className='footerLogo' alt="Studylance logo" />
                </div>
            </footer>
        </>
    )
}
