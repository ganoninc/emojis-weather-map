import React, { Component } from 'react';
import EmojiWeatherMapSettings from './EmojiWeatherMapSettings';
import EmojiWeatherMap from './EmojiWeatherMap';
import './App.scss';

class App extends Component {

  constructor(props) {
    super(props);

    this.handleLoadingActionStart = this.handleLoadingActionStart.bind(this);
    this.handleLoadingActionEnd = this.handleLoadingActionEnd.bind(this);
    this.handleSelectedMap = this.handleSelectedMap.bind(this);

    this.state = {
      emojiWeatherMapTemplate: null,
      isLoadingTemplate: false,
      loadingActionsCount: 0
    };
  }

  handleLoadingActionStart() {
    this.setState(state => { 
      return {
        loadingActionsCount: state.loadingActionsCount + 1
      };
    });
  }

  handleLoadingActionEnd() {
    this.setState(state => {
      return {
        loadingActionsCount: state.loadingActionsCount - 1
      };
    });    
  }

  handleSelectedMap(mapTemplateURL) {
    this.setState({ isLoadingTemplate: true });

    fetch(mapTemplateURL)
      .then(response => response.json())
      .then(data => this.setState({ emojiWeatherMapTemplate: data, isLoadingTemplate: false }));
  }

  // componentDidMount() {
  // }

  render() {
    const { emojiWeatherMapTemplate, isLoadingTemplate, loadingActionsCount } = this.state;
    let mapView;
    
    if (isLoadingTemplate || !emojiWeatherMapTemplate) {
      mapView = <p>Loading map...</p>;
    } else {
      mapView = <EmojiWeatherMap template={emojiWeatherMapTemplate} onLoading={this.handleLoadingActionStart} onLoaded={this.handleLoadingActionEnd}></EmojiWeatherMap>;
    }
    return (
      <div className="App">
        <div className="container">
          <div className="row align-items-center App__body">
            <div className="col-lg-12 App__settings">
              <EmojiWeatherMapSettings displayLoadingIcon={loadingActionsCount > 0} onMapSelected={this.handleSelectedMap} isLoadingTemplate={this.isLoadingTemplate}></EmojiWeatherMapSettings>
            </div>
            <div className="col-lg-12 App__mapView">
              {mapView}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;