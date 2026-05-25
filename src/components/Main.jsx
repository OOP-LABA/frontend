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
          <img src={heroImage} alt="Главный экран Studylance" className="heroImage" />
          <div className="heroOverlay" />

          <div className="heroContent">
            <div className="heroBadge">Studylance</div>
            <h1 className="heroTitle">Студенты публикуют задания. Исполнители зарабатывают.</h1>
            <p className="heroSubtitle">
              Добавьте свое задание, укажите бюджет и найдите человека, который поможет быстро и без лишней суеты.
            </p>

            <div className="heroActions">
              <Link to="/posts" style={{ textDecoration: 'none' }}>
                <Button size="lg" color="violet" variant="filled">
                  Смотреть задания
                </Button>
              </Link>

              <Link
                to={isLoggedIn ? "/posts?new=1" : "/signup"}
                style={{ textDecoration: 'none' }}
              >
                <Button size="lg" color="violet" variant="light">
                  Опубликовать задание
                </Button>
              </Link>
            </div>

            <div className="heroHint">
              Совет: оставьте Telegram, Discord или почту в поле контактов, чтобы исполнитель мог быстро связаться с вами.
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <div className="sectionInner">
          <div className="featureGrid">
            <div className="featureCard">
              <div className="featureTitle">Опишите задание</div>
              <div className="featureText">Добавьте подробности, прикрепите скриншот и выберите предмет.</div>
            </div>

            <div className="featureCard">
              <div className="featureTitle">Укажите бюджет</div>
              <div className="featureText">В поле «Бюджет» поставьте сумму, которую готовы заплатить за работу.</div>
            </div>

            <div className="featureCard">
              <div className="featureTitle">Получите результат</div>
              <div className="featureText">Исполнители откликаются, связываются с вами и доводят задачу до результата.</div>
            </div>
          </div>

          <div className="sectionMedia">
            <img src={sectionImage} alt="Студент за работой" className="sectionImage" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
