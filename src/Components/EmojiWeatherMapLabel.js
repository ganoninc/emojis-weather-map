import React, { Component } from "react";
import "../styles/EmojiWeatherMapLabel.scss";

class EmojiWeatherMapLabel extends Component {
  render() {
    return (
      <h3 className="EmojiWeatherMapLabel">
        {this.props.icon} {this.props.name}
      </h3>
    );
  }
}

export default EmojiWeatherMapLabel;
