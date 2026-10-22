import React, { Component } from "react";
import LoadingImage from "../assets/EmojiWeatherMapEmojiLoading.svg";

// Convert an Open-Meteo WMO weather code to the OpenWeatherMap-style icon
// code ("01d", "10n"...) used by the emoji and label mappings below.
// See https://open-meteo.com/en/docs#weather_variable_documentation
function getIconCode(weatherCode, isDay) {
  let icon;
  if (weatherCode === 0) icon = "01"; // Clear sky
  else if (weatherCode === 1) icon = "02"; // Mainly clear
  else if (weatherCode === 2) icon = "03"; // Partly cloudy
  else if (weatherCode === 3) icon = "04"; // Overcast
  else if ([45, 48].includes(weatherCode)) icon = "50"; // Fog
  else if ([51, 53, 55, 56, 57, 80, 81, 82].includes(weatherCode))
    icon = "09"; // Drizzle, rain showers
  else if ([61, 63, 65].includes(weatherCode)) icon = "10"; // Rain
  else if ([66, 67, 71, 73, 75, 77, 85, 86].includes(weatherCode))
    icon = "13"; // Freezing rain, snow
  else if ([95, 96, 99].includes(weatherCode)) icon = "11"; // Thunderstorm
  else return null;
  return icon + (isDay ? "d" : "n");
}

class EmojiWeatherMapEmoji extends Component {
  getCurrentWeatherIcon(data) {
    let currentWeatherIcon;
    switch (data) {
      case "01d":
        currentWeatherIcon = "☀️";
        break;
      case "01n":
        currentWeatherIcon = "🌕";
        break;
      case "02d":
        currentWeatherIcon = "🌤️";
        break;
      case "02n":
        currentWeatherIcon = "☁️";
        break;
      case "03d":
        currentWeatherIcon = "⛅";
        break;
      case "03n":
        currentWeatherIcon = "☁️";
        break;
      case "04d":
        currentWeatherIcon = "☁️";
        break;
      case "04n":
        currentWeatherIcon = "☁️";
        break;
      case "09d":
        currentWeatherIcon = "️️🌧️";
        break;
      case "09n":
        currentWeatherIcon = "🌧️";
        break;
      case "10d":
        currentWeatherIcon = "️️🌦️";
        break;
      case "10n":
        currentWeatherIcon = "🌧️";
        break;
      case "11d":
        currentWeatherIcon = "️️⛈️";
        break;
      case "11n":
        currentWeatherIcon = "⛈️";
        break;
      case "13d":
        currentWeatherIcon = "️️🌨️";
        break;
      case "13n":
        currentWeatherIcon = "🌨️";
        break;
      case "50d":
        currentWeatherIcon = "️️🌫️";
        break;
      case "50n":
        currentWeatherIcon = "🌫️";
        break;

      default:
        currentWeatherIcon = "❌";
        break;
    }
    return currentWeatherIcon;
  }

  getCurrentWeatherLabel(data) {
    let currentWeatherLabel;
    switch (data) {
      case "01d":
      case "01n":
        currentWeatherLabel = "Clear Sky";
        break;
      case "02d":
      case "02n":
        currentWeatherLabel = "Few Clouds";
        break;
      case "03d":
      case "03n":
        currentWeatherLabel = "Scattered Clouds";
        break;
      case "04d":
      case "04n":
        currentWeatherLabel = "Broken Clouds";
        break;
      case "09d":
      case "09n":
        currentWeatherLabel = "Shower Rain";
        break;
      case "10d":
      case "10n":
        currentWeatherLabel = "Rain";
        break;
      case "11d":
      case "11n":
        currentWeatherLabel = "Thunderstorm";
        break;
      case "13d":
      case "13n":
        currentWeatherLabel = "Snow";
        break;
      case "50d":
      case "50n":
        currentWeatherLabel = "Mist";
        break;

      default:
        currentWeatherLabel = "Error";
        break;
    }
    return currentWeatherLabel;
  }

  render() {
    const { weather } = this.props;

    if (!weather) {
      return (
        <span
          className="emojiWeatherMap__emojiLoading"
          role="img"
          aria-label="Loading"
        >
          <img alt="emoji" src={LoadingImage} />
        </span>
      );
    } else {
      const iconCode = getIconCode(weather.weatherCode, weather.isDay);
      const currentWeatherIcon = this.getCurrentWeatherIcon(iconCode);
      const currentWeatherLabel = this.getCurrentWeatherLabel(iconCode);
      return (
        <span
          className="emojiWeatherMap__emoji"
          role="img"
          aria-label={currentWeatherLabel}
        >
          {currentWeatherIcon}
        </span>
      );
    }
  }
}

export default EmojiWeatherMapEmoji;
