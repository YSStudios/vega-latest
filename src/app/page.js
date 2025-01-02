"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Particle from "../components/Particle";
import NoiseBackground from "../components/NoiseBackground";
import IntroButton from "../components/IntroButton";
import ThemeSelector from "../components/ThemeSelector";
import Header from "../components/Header";
import SidebarRight from "../components/SidebarRight";
import ModalGrid from "../components/ModalGrid";
import { useSelector } from "react-redux";
import gsap from "gsap";
import { Draggable } from "gsap/all"; // or "gsap/Draggable" depending on your setup

gsap.registerPlugin(Draggable);

export default function Home() {
  const [showButton, setShowButton] = useState(false);
  const [isCaseStudyClicked, setIsCaseStudyClicked] = useState(false);
  const [focusedComponent, setFocusedComponent] = useState(null);
  const loaderActive = useSelector((state) => state.active.loaderActive);
  const buttonRef = useRef(null);
  const vegaButtonSoundRef = useRef(null);
  const animationSpeedRef = useRef(0.008);
  const [pageData, setPageData] = useState({
    caseStudies: null,
    about: null,
    trans: null,
    vegaTv: null,
    songData: null
  });

  const handleFocus = (refName) => {
    if (
      refName !== "caseRef" ||
      (refName === "caseRef" && !isCaseStudyClicked)
    ) {
      setFocusedComponent(refName);
      gsap.set(refName, { zIndex: Draggable.zIndex++ });
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fetchData');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Fetched data:", data); // Debug log
        setPageData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
      <ThemeSelector />
      <SidebarRight
        handleFocus={handleFocus}
        setFocusedComponent={setFocusedComponent}
        focusedComponent={focusedComponent}
        isCaseStudyClicked={isCaseStudyClicked}
        setIsCaseStudyClicked={setIsCaseStudyClicked}
        className="fadeIn"
      />
      <ModalGrid
        caseStudies={pageData.caseStudies}
        about={pageData.about}
        trans={pageData.trans}
        vegaTv={pageData.vegaTv}
        songData={pageData.songData}
        setFocusedComponent={setFocusedComponent}
        focusedComponent={focusedComponent}
        isCaseStudyClicked={isCaseStudyClicked}
        setIsCaseStudyClicked={setIsCaseStudyClicked}
        className="fadeIn"
      />
      <audio
        ref={vegaButtonSoundRef}
        src="https://res.cloudinary.com/dtps5ugbf/video/upload/v1722389161/site_open_2_iucevj.wav"
      />
    </>
  );
}
