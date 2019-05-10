import React, { Component } from 'react';
import EmojiWeatherMapSelector from './EmojiWeatherMapSelector';
import EmojiWeatherMap from './EmojiWeatherMap';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";
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
    let content;
    
    if (isLoadingTemplate || !emojiWeatherMapTemplate) {
      content = <p>Loading map...</p>;
    } else {
      content = <EmojiWeatherMap template={emojiWeatherMapTemplate} onLoading={this.handleLoadingActionStart} onLoaded={this.handleLoadingActionEnd}></EmojiWeatherMap>;
    }
    return (
      <div className="App">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4 title">
              <h1> Emoji Weather Map {loadingActionsCount > 0 ? <img alt="Loading" src={LoadingImage} />  : ""}</h1>
              <EmojiWeatherMapSelector onMapSelected={this.handleSelectedMap} isLoadingTemplate={this.isLoadingTemplate}></EmojiWeatherMapSelector>
            </div>
            <div className="col-lg-8">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;