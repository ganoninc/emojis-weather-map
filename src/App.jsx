import React, { Component } from "react";
import { ApiBaseUrlContext } from "./Context/ApiBaseUrlContext";
import EmojiWeatherMapSettings from "./Components/EmojiWeatherMapSettings";
import EmojiWeatherMap from "./Components/EmojiWeatherMap";
import "./styles/App.scss";

class App extends Component {
  constructor(props) {
    super(props);

    this.handleLoadingActionStart = this.handleLoadingActionStart.bind(this);
    this.handleLoadingActionEnd = this.handleLoadingActionEnd.bind(this);
    this.handleSelectedMap = this.handleSelectedMap.bind(this);
    this.handleWeatherLoaded = this.handleWeatherLoaded.bind(this);

    this.state = {
      emojiWeatherMapTemplate: null,
      isLoadingTemplate: false,
      loadingActionsCount: 0,
      isNight: false,
    };

    this.apiBaseUrl = import.meta.env.VITE_WEATHER_API_BASE_URL;
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
    this.setState({ isNight: nightCount > known.length / 2 });
  }

  handleSelectedMap(mapTemplateURL) {
    this.setState({ isLoadingTemplate: true });

    fetch(mapTemplateURL)
      .then((response) => response.json())
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
    } = this.state;
    let mapView;

    if (isLoadingTemplate || !emojiWeatherMapTemplate) {
      mapView = <p>Loading map...</p>;
    } else {
      mapView = (
        <EmojiWeatherMap
          template={emojiWeatherMapTemplate}
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
