"use client";
import { useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Particle from "../components/Particle";

export default function Home() {
  const animationSpeedRef = useRef(0.008);
  return (
    <>
      <Particle animationSpeedRef={animationSpeedRef} />
    </>
  );
}
