import React from 'react';
import { Link } from "react-router-dom";
import { Button } from '@mantine/core';
import { useSelector } from 'react-redux';
import Header from "./Header";
import Footer from './Footer';
import heroImage from "../assets/dw.jpg";
import sectionImage from "../assets/man.jpg";

export default function Main() {
  const isLoggedIn = useSelector(state => state.app.isLoggedIn);

  return (
    <>
      <div className="main-container">
        <Header />

        <section className="hero">
          <img src={heroImage} alt="Studylance hero" className="heroImage" />
          <div className="heroOverlay" />

          <div className="heroContent">
            <div className="heroBadge">Studylance</div>
            <h1 className="heroTitle">Students post tasks. Solvers earn.</h1>
            <p className="heroSubtitle">
              Submit your assignment, set a budget, and get it done by someone who can help — fast and simple.
            </p>

            <div className="heroActions">
              <Link to="/posts" style={{ textDecoration: 'none' }}>
                <Button size="lg" color="violet" variant="filled">
                  Browse tasks
                </Button>
              </Link>

              <Link
                to={isLoggedIn ? "/posts?new=1" : "/signup"}
                style={{ textDecoration: 'none' }}
              >
                <Button size="lg" color="violet" variant="light">
                  Post a task
                </Button>
              </Link>
            </div>

            <div className="heroHint">
              Tip: leave a Telegram/Discord handle in “Contact” so solvers can reach you.
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <div className="sectionInner">
          <div className="featureGrid">
            <div className="featureCard">
              <div className="featureTitle">Post your assignment</div>
              <div className="featureText">Describe the task, attach a screenshot, and pick a category.</div>
            </div>

            <div className="featureCard">
              <div className="featureTitle">Set a budget</div>
              <div className="featureText">Use “Budget” as the fixed price you’re ready to pay.</div>
            </div>

            <div className="featureCard">
              <div className="featureTitle">Get it completed</div>
              <div className="featureText">Solvers contact you and deliver the result. Keep it simple.</div>
            </div>
          </div>

          <div className="sectionMedia">
            <img src={sectionImage} alt="Student working" className="sectionImage" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
