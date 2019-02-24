import React, { Component } from 'react';
import EmojiWeatherMap from './EmojiWeatherMap'
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emojiWeatherMapTemplate: null,
      isLoadingTemplate: false
    };
  }

  componentDidMount() {
    this.setState({ isLoadingTemplate: true });

    fetch('./templates/france.json')
      .then(response => response.json())
      .then(data => this.setState({ emojiWeatherMapTemplate: data, isLoadingTemplate: false }));
  }

  render() {
    const { emojiWeatherMapTemplate, isLoadingTemplate } = this.state;
    
    if(isLoadingTemplate || !emojiWeatherMapTemplate) {
      return (
        <div className="App">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-4">
                <h1>Emoji Weather Map</h1>
                <p>Loading map...</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="App">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-4">
                <h1>Emoji Weather Map</h1>
              </div>
              <div className="col-lg-8">
                <EmojiWeatherMap template={emojiWeatherMapTemplate}></EmojiWeatherMap>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default App;