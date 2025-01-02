import React, { useEffect, useState, useCallback } from "react";
import styles from "../styles/Header.module.scss";
import TimeWeather from "../components/TimeWeather";
import { useSelector, useDispatch } from "react-redux";
import { toggleLoaderActive } from "../slices/modalSlice";
import { fetchWeatherData } from "../api/weatherApi";

const Header = () => {
  const dispatch = useDispatch();
  const loaderActive = useSelector((state) => {
    return state.active ? state.active.loaderActive : null;
  });

  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const getWeatherData = async () => {
      const data = await fetchWeatherData("new york");
      setWeatherData(data);
    };

    getWeatherData();
  }, []);

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
      {weatherData && <TimeWeather weatherData={weatherData} />}
    </header>
  );
};

export default Header;
