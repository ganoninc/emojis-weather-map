import React, { Component } from "react";
import { ApiBaseUrlContext } from "../Context/ApiBaseUrlContext";
import EmojiWeatherMapRow from "./EmojiWeatherMapRow";
// import EmojiWeatherMapLabel from "./EmojiWeatherMapLabel";
import { cachedFetchJson, getFetchTime } from "../utils/cachedFetch";
import { getWeatherExpiry } from "../utils/weatherSchedule";
import "../styles/EmojiWeatherMap.scss";

// Unix seconds to milliseconds. Missing during polar day or night.
function toMilliseconds(seconds) {
  return seconds ? seconds * 1000 : null;
}

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
    this.loadWeather();
  }

  componentDidUpdate(prevProps) {
    // Bumping refreshKey re-fetches the weather, keeping the current emojis
    // on screen until the new data arrives.
    if (prevProps.refreshKey !== this.props.refreshKey) {
      this.loadWeather(true);
    }
  }

  loadWeather(refresh = false) {
    const coordinates = this.getCoordinates();

    // Open-Meteo accepts comma-separated lists: one request for the whole map.
    const dataProviderEndpoint =
      this.context +
      "?latitude=" +
      coordinates.map((c) => c.latitude).join(",") +
      "&longitude=" +
      coordinates.map((c) => c.longitude).join(",") +
      "&current=weather_code,is_day,temperature_2m" +
      "&daily=sunrise,sunset&forecast_days=1" +
      // Sun times as Unix timestamps, comparable with Date.now().
      "&timeformat=unixtime" +
      "&timezone=auto";

    this.props.onLoading();

    // A refresh skips the cache, otherwise it would return the same data.
    cachedFetchJson(dataProviderEndpoint, {
      getExpiry: getWeatherExpiry,
      refresh,
    })
      .then((data) => {
        // A single location is returned as an object, several as an array.
        const locations = Array.isArray(data) ? data : [data];
        return locations.map((location) => ({
          weatherCode: location.current.weather_code,
          isDay: location.current.is_day === 1,
          temperature: location.current.temperature_2m,
          sunrise: toMilliseconds(location.daily && location.daily.sunrise[0]),
          sunset: toMilliseconds(location.daily && location.daily.sunset[0]),
          timeZone: location.timezone,
          timeZoneAbbreviation: location.timezone_abbreviation,
        }));
      })
      .catch(() => coordinates.map(() => ({ weatherCode: null })))
      .then((weathers) => {
        this.props.onLoaded();
        // Cached weather keeps its original fetch time, so "updated X min
        // ago" and the auto-refresh stay accurate.
        this.props.onWeatherLoaded(weathers, getFetchTime(dataProviderEndpoint));
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
