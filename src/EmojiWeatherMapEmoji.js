import React, { Component } from 'react';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";

class EmojiWeatherMapEmoji extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      currentWeatherIcon: null
    };

    this.dataProviderEndpoint = 'https://giovanetti.fr/ewm-data-provider/?latitude=' + props.geographicCoordinates.latitude + '&longitude=' + props.geographicCoordinates.longitude;
  }

  getCurrentWeatherIcon(data) {
    let currentWeatherIcon;
    switch (data) {
      case '01d':
        currentWeatherIcon = '☀️';
        break;
      case '01n':
        currentWeatherIcon = '🌕';
        break;
      case '02d':
        currentWeatherIcon = '🌤️';
        break;
      case '02n':
        currentWeatherIcon = '☁️';
        break;
      case '03d':
        currentWeatherIcon = '️️☁️';
        break;
      case '03n':
        currentWeatherIcon = '☁️';
        break;
      case '04d':
        currentWeatherIcon = '️️☁️';
        break;
      case '04n':
        currentWeatherIcon = '☁️';
        break;
      case '09d':
        currentWeatherIcon = '️️🌧️';
        break;
      case '09n':
        currentWeatherIcon = '🌧️';
        break;
      case '10d':
        currentWeatherIcon = '️️🌦️';
        break;
      case '10n':
        currentWeatherIcon = '🌧️';
        break;
      case '11d':
        currentWeatherIcon = '️️⛈️';
        break;
      case '11n':
        currentWeatherIcon = '⛈️';
        break;
      case '13d':
        currentWeatherIcon = '️️🌨️';
        break;
      case '13n':
        currentWeatherIcon = '🌨️';
        break;
      case '50d':
        currentWeatherIcon = '️️🌫️';
        break;
      case '50n':
        currentWeatherIcon = '🌫️';
        break;
    
      default:
        currentWeatherIcon = '❌';
        break;
    }
    return currentWeatherIcon;
  }

  getCurrentWeatherLabel(data) {
    let currentWeatherLabel;
    switch (data) {
      case '01d':
      case '01n':
        currentWeatherLabel = 'Clear Sky';
        break;
      case '02d':
      case '02n':
        currentWeatherLabel = 'Few Clouds';
        break;
      case '03d':
      case '03n':
        currentWeatherLabel = 'Scattered Clouds';
        break;
      case '04d':
      case '04n':
        currentWeatherLabel = 'Broken Clouds';
        break;
      case '09d':
      case '09n':
        currentWeatherLabel = 'Shower Rain';
        break;
      case '10d':
      case '10n':
        currentWeatherLabel = 'Rain';
        break;
      case '11d':
      case '11n':
        currentWeatherLabel = 'Thunderstorm';
        break;
      case '13d':
      case '13n':
        currentWeatherLabel = 'Snow';
        break;
      case '50d':
      case '50n':
        currentWeatherLabel = 'Mist';
        break;

      default:
        currentWeatherLabel = 'Error';
        break;
    }
    return currentWeatherLabel;
  }

  componentDidMount() {
    this.setState(() => {
      this.props.onLoading();
      return { isLoading: true };
    });

    fetch(this.dataProviderEndpoint)
      .then(response => response.text())
      .then(data => {
        this.setState((state, props) => { 
          props.onLoaded();
          return {
            isLoading: false, currentWeatherIcon: this.getCurrentWeatherIcon(data), currentWeatherLabel: this.getCurrentWeatherLabel(data)
          };
        });
      });
  }

  render() {
    const { isLoading, currentWeatherIcon, currentWeatherLabel } = this.state;

    if (isLoading){
      return (
        <span className="emoji" role="img" aria-label="Loading">
          <img className="emoji-loading" alt="emoji" src={LoadingImage} />
        </span>
      );
    } else {
      return (
        <span className="emoji" role="img" aria-label={currentWeatherLabel}>
          {currentWeatherIcon}
        </span>
      );
    }
  }
}

export default EmojiWeatherMapEmoji;