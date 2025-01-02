import React, { useEffect, useCallback } from "react";
import styles from "../styles/Header.module.scss";
import TimeWeather from "../components/TimeWeather";
import { useSelector, useDispatch } from "react-redux";
import { toggleLoaderActive } from "../slices/modalSlice";

const Header = ({ weatherData }) => {
  const dispatch = useDispatch();
  const loaderActive = useSelector((state) => {
    return state.active ? state.active.loaderActive : null;
  });

  useEffect(() => {}, [loaderActive]);

  const handleLogoClick = useCallback(
    (e) => {
      e.preventDefault();
      try {
        dispatch(toggleLoaderActive());
      } catch (error) {}
    },
    [dispatch, loaderActive]
  );

  if (loaderActive === null) {
    return null; // or some fallback UI
  }

  return (
    <header
      className={`${styles.header} ${
        !loaderActive ? styles.fadeIn : styles.fadeOut
      }`}
    >
      <a className={styles.header_logo} href="#" onClick={handleLogoClick} />
      <div className={styles.deco_container}>
        <div className={styles.deco_left}> </div>
        <div className={styles.deco_middle}> </div>
        <div className={styles.deco_right}></div>
      </div>
      <TimeWeather weatherData={weatherData} />
    </header>
  );
};

export default Header;
