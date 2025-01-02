"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Particle from "../components/Particle";
import NoiseBackground from "../components/NoiseBackground";
import IntroButton from "../components/IntroButton";
import Header from "../components/Header";
import { useSelector } from "react-redux";
import gsap from "gsap";

export default function Home() {
  const [showButton, setShowButton] = useState(false);
  const loaderActive = useSelector((state) => state.active.loaderActive);
  const buttonRef = useRef(null);
  const vegaButtonSoundRef = useRef(null);
  const animationSpeedRef = useRef(0.008);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleButtonComplete = () => {
    if (vegaButtonSoundRef.current) {
      vegaButtonSoundRef.current.volume = 0.4;
      vegaButtonSoundRef.current
        .play()
        .catch((error) =>
          console.error("Error playing Vega button sound:", error)
        );
    }
    animationSpeedRef.current = 0.08;
  };

  useEffect(() => {
    if (showButton && buttonRef.current) {
      gsap.to(buttonRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
  }, [showButton]);

  useEffect(() => {
    gsap.to(".fadeIn", {
      opacity: loaderActive ? 0 : 1,
      duration: 5,
      stagger: loaderActive ? 0 : 0.5,
      ease: "power2.inOut",
    });
  }, [loaderActive]);

  return (
    <>
      <Particle animationSpeedRef={animationSpeedRef} />
      <NoiseBackground />
      {showButton && (
        <IntroButton
          ref={buttonRef}
          onComplete={handleButtonComplete}
          style={{
            opacity: 0,
            visibility: loaderActive ? "visible" : "hidden",
          }}
        />
      )}
      <Header className="fadeIn" style={{ opacity: 0 }} />
      <audio
        ref={vegaButtonSoundRef}
        src="https://res.cloudinary.com/dtps5ugbf/video/upload/v1722389161/site_open_2_iucevj.wav"
      />
    </>
  );
}
