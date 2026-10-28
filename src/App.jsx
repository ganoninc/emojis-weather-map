import React, { Component } from "react";
import { ApiBaseUrlContext } from "./Context/ApiBaseUrlContext";
import EmojiWeatherMapSettings from "./Components/EmojiWeatherMapSettings";
import EmojiWeatherMap from "./Components/EmojiWeatherMap";
import EmojiWeatherMapStatus from "./Components/EmojiWeatherMapStatus";
import { cachedFetchJson } from "./utils/cachedFetch";
import "./styles/App.scss";

// Weather older than this is reloaded automatically. Open-Meteo updates its
// current conditions every 15 minutes.
const AUTO_REFRESH_DELAY = 15 * 60 * 1000;
const CLOCK_TICK_DELAY = 30 * 1000;

// The time zone shared by most of the map's emojis.
function getMainTimeZone(weathers) {
  const counts = {};
  let main = null;
  weathers.forEach((weather) => {
    counts[weather.timeZone] = (counts[weather.timeZone] || 0) + 1;
    if (!main || counts[weather.timeZone] > counts[main.timeZone]) {
      main = weather;
    }
  });
  return main;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.handleLoadingActionStart = this.handleLoadingActionStart.bind(this);
    this.handleLoadingActionEnd = this.handleLoadingActionEnd.bind(this);
    this.handleSelectedMap = this.handleSelectedMap.bind(this);
    this.handleWeatherLoaded = this.handleWeatherLoaded.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleClockTick = this.handleClockTick.bind(this);

    this.state = {
      emojiWeatherMapTemplate: null,
      isLoadingTemplate: false,
      loadingActionsCount: 0,
      isNight: false,
      lastUpdated: null,
      refreshKey: 0,
      timeZone: null,
      timeZoneAbbreviation: null,
      now: new Date(),
    };

    this.apiBaseUrl = import.meta.env.VITE_WEATHER_API_BASE_URL;
  }

  componentDidMount() {
    this.clockInterval = setInterval(this.handleClockTick, CLOCK_TICK_DELAY);
    document.addEventListener("visibilitychange", this.handleClockTick);
  }

  componentWillUnmount() {
    clearInterval(this.clockInterval);
    document.removeEventListener("visibilitychange", this.handleClockTick);
  }

  // Keeps the local time and "updated X min ago" current, and reloads stale
  // weather while the page is visible (e.g. when coming back to the tab).
  handleClockTick() {
    if (document.hidden) {
      return;
    }
    const now = new Date();
    const { lastUpdated, loadingActionsCount } = this.state;
    this.setState({ now });
    if (
      lastUpdated &&
      loadingActionsCount === 0 &&
      now - lastUpdated >= AUTO_REFRESH_DELAY
    ) {
      this.handleRefresh();
    }
  }

  handleLoadingActionStart() {
    this.setState((state) => {
      return {
        loadingActionsCount: state.loadingActionsCount + 1,
      };
    });
  }

  handleLoadingActionEnd() {
    this.setState((state) => {
      return {
        loadingActionsCount: state.loadingActionsCount - 1,
      };
    });
  }

  handleWeatherLoaded(weathers) {
    // Night theme when most of the country is in the dark. Keep the current
    // theme if the weather couldn't be loaded.
    const known = weathers.filter((weather) => weather.isDay !== undefined);
    if (known.length === 0) {
      return;
    }
    const nightCount = known.filter((weather) => !weather.isDay).length;
    const mainTimeZone = getMainTimeZone(known);
    const now = new Date();
    this.setState({
      isNight: nightCount > known.length / 2,
      lastUpdated: now,
      now,
      timeZone: mainTimeZone.timeZone,
      timeZoneAbbreviation: mainTimeZone.timeZoneAbbreviation,
    });
  }

  handleRefresh() {
    this.setState((state) => {
      return {
        refreshKey: state.refreshKey + 1,
      };
    });
  }

  handleSelectedMap(mapTemplateURL) {
    this.setState({
      isLoadingTemplate: true,
      lastUpdated: null,
      timeZone: null,
      timeZoneAbbreviation: null,
    });

    // Templates are static: cache them for the whole session.
    cachedFetchJson(mapTemplateURL)
      .then((data) => {
        this.setState({
          emojiWeatherMapTemplate: data,
          isLoadingTemplate: false,
        });
      });
  }

  render() {
    const {
      emojiWeatherMapTemplate,
      isLoadingTemplate,
      loadingActionsCount,
      isNight,
      lastUpdated,
      refreshKey,
      timeZone,
      timeZoneAbbreviation,
      now,
    } = this.state;
    let mapView;

    if (isLoadingTemplate || !emojiWeatherMapTemplate) {
      mapView = <p>Loading map...</p>;
    } else {
      mapView = (
        <EmojiWeatherMap
          template={emojiWeatherMapTemplate}
          refreshKey={refreshKey}
          onLoading={this.handleLoadingActionStart}
          onLoaded={this.handleLoadingActionEnd}
          onWeatherLoaded={this.handleWeatherLoaded}
        ></EmojiWeatherMap>
      );
    }
    return (
      <ApiBaseUrlContext.Provider value={this.apiBaseUrl}>
        <div className={isNight ? "App App--night" : "App"}>
          <div className="container">
            <div className="row align-items-center App__body">
              <div className="col-12 App__settings">
                <EmojiWeatherMapSettings
                  displayLoadingIcon={loadingActionsCount > 0}
                  onMapSelected={this.handleSelectedMap}
                  isLoadingTemplate={isLoadingTemplate}
                ></EmojiWeatherMapSettings>
              </div>
              <div className="col-12 App__status">
                <EmojiWeatherMapStatus
                  country={emojiWeatherMapTemplate}
                  timeZone={timeZone}
                  timeZoneAbbreviation={timeZoneAbbreviation}
                  now={now}
                  lastUpdated={lastUpdated}
                  isRefreshing={loadingActionsCount > 0}
                  onRefresh={this.handleRefresh}
                ></EmojiWeatherMapStatus>
              </div>
              <div className="col-12 App__mapView">{mapView}</div>
              <div className="col-12 App__footer">
                <hr></hr>
                <p>
                  2018 - A simple React app made by{" "}
                  <a
                    href="https://www.giovanetti.fr/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Romain Giovanetti
                  </a>{" "}
                  -{" "}
                  <a
                    href="https://github.com/ganoninc/emojis-weather-map"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View source
                  </a>{" "}
                  -{" "}
                  <a
                    href="https://open-meteo.com/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Weather data by Open-Meteo.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </ApiBaseUrlContext.Provider>
    );
  }
}

export default App;
