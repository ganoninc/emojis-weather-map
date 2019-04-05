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

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch(this.dataProviderEndpoint)
      .then(response => response.text())
      .then(data => this.setState({ isLoading: false, currentWeatherIcon: data }));
  }
  render() {
    const { isLoading, currentWeatherIcon } = this.state;

    if (isLoading){
      return (
        <span className="emoji" role="img" aria-label="Loading">
          <img className="emoji-loading" alt="emoji" src={LoadingImage} />
        </span>
      );
    } else {
      return (
        <span className="emoji" role="img" aria-label="Sun">
          {currentWeatherIcon}
        </span>
      );
    }
  }
}

export default EmojiWeatherMapEmoji;