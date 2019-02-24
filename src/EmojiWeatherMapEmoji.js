import React, { Component } from 'react';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";

class EmojiWeatherMapEmoji extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

  }
  render() {
    const { isLoading } = this.state;

    if (isLoading){
      return (
        <span className="emoji" role="img" aria-label="Loading">
          <img className="emoji-loading" src={LoadingImage} />
      </span>
      );
    } else {
      return (
        <span className="emoji" role="img" aria-label="Sun">
          ☀️
      </span>
      );
    }
  }
}

export default EmojiWeatherMapEmoji;