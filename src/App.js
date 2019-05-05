import React, { Component } from 'react';
import EmojiWeatherMap from './EmojiWeatherMap';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.handleLoadingActionStart = this.handleLoadingActionStart.bind(this);
    this.handleLoadingActionEnd = this.handleLoadingActionEnd.bind(this);

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

  componentDidMount() {
    this.setState({ isLoadingTemplate: true });

    fetch('./templates/france.json')
      .then(response => response.json())
      .then(data => this.setState({ emojiWeatherMapTemplate: data, isLoadingTemplate: false }));
  }

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
              <h1> Emoji Weather Map {loadingActionsCount > 0 ? <img alt="Loading" src={LoadingImage} />
                : ""}</h1>
              {/* <EmojiWeatherMapSelector></EmojiWeatherMapSelector> */}
            </div>
            <div className="col-lg-8 content">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;