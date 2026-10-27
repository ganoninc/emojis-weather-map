import React, { Component } from "react";
import { ApiBaseUrlContext } from "../Context/ApiBaseUrlContext";
import EmojiWeatherMapRow from "./EmojiWeatherMapRow";
// import EmojiWeatherMapLabel from "./EmojiWeatherMapLabel";
import { cachedFetchJson } from "../utils/cachedFetch";
import "../styles/EmojiWeatherMap.scss";

// Open-Meteo refreshes "current" data every 15 minutes.
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000;

class EmojiWeatherMap extends Component {
  static contextType = ApiBaseUrlContext;

  constructor(props) {
    super(props);

    this.state = {
      // One entry per emoji, in template order. null while loading.
      weathers: null,
    };
  }

  getCoordinates() {
    return this.props.template.rows.flatMap((row) =>
      row.items
        .filter((item) => item.type === "emoji")
        .map((item) => item.geographicCoordinates)
    );
  }

  componentDidMount() {
    const coordinates = this.getCoordinates();

    // Open-Meteo accepts comma-separated lists: one request for the whole map.
    const dataProviderEndpoint =
      this.context +
      "?latitude=" +
      coordinates.map((c) => c.latitude).join(",") +
      "&longitude=" +
      coordinates.map((c) => c.longitude).join(",") +
      "&current=weather_code,is_day";

    this.props.onLoading();

    cachedFetchJson(dataProviderEndpoint, WEATHER_CACHE_TTL_MS)
      .then((data) => {
        // A single location is returned as an object, several as an array.
        const locations = Array.isArray(data) ? data : [data];
        return locations.map((location) => ({
          weatherCode: location.current.weather_code,
          isDay: location.current.is_day === 1,
        }));
      })
      .catch(() => coordinates.map(() => ({ weatherCode: null })))
      .then((weathers) => {
        this.props.onLoaded();
        this.props.onWeatherLoaded(weathers);
        this.setState({ weathers });
      });
  }

  render() {
    const { weathers } = this.state;
    let emojiIndex = 0;

    return (
      <>
        <div className="emojiWeatherMap">
          {this.props.template.rows.map((row, index) => {
            const firstEmojiIndex = emojiIndex;
            emojiIndex += row.items.filter((i) => i.type === "emoji").length;
            return (
              <EmojiWeatherMapRow
                key={index}
                row={row}
                weathers={
                  weathers && weathers.slice(firstEmojiIndex, emojiIndex)
                }
              ></EmojiWeatherMapRow>
            );
          })}
        </div>
        {/* <EmojiWeatherMapLabel
          name={this.props.template.name}
          icon={this.props.template.icon}
        ></EmojiWeatherMapLabel> */}
      </>
    );
  }
}

export default EmojiWeatherMap;
