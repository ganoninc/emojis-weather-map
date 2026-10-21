import React, { Component } from "react";
import EmojiWeatherMapOffset from "./EmojiWeatherMapOffset";
import EmojiWeatherMapEmoji from "./EmojiWeatherMapEmoji";

class EmojiWeatherMapRow extends Component {
  render() {
    const { weathers } = this.props;
    let emojiIndex = 0;

    return (
      <div className="emojiWeatherMap__row">
        {this.props.row.items.map((item, index) => {
          let returnedItem = null;
          if (item.type === "offset") {
            returnedItem = (
              <EmojiWeatherMapOffset
                key={index}
                length={item.length}
              ></EmojiWeatherMapOffset>
            );
          } else if (item.type === "emoji") {
            returnedItem = (
              <EmojiWeatherMapEmoji
                key={index}
                weather={weathers && weathers[emojiIndex]}
              ></EmojiWeatherMapEmoji>
            );
            emojiIndex++;
          }
          return returnedItem;
        })}
      </div>
    );
  }
}

export default EmojiWeatherMapRow;
