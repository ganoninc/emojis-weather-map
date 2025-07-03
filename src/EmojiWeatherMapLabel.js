import React, { Component } from "react";
import "./styles/EmojiWeatherMapLabel.scss";

class EmojiWeatherMapLabel extends Component {
  render() {
    return (
      <h2 className="EmojiWeatherMapLabel">
        {this.props.icon} {this.props.name}
      </h2>
    );
  }
}

export default EmojiWeatherMapLabel;
