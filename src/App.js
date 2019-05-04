import React, { Component } from 'react';
import EmojiWeatherMap from './EmojiWeatherMap';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emojiWeatherMapTemplate: null,
      isLoading: false,
      isLoadingTemplate: false
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true, isLoadingTemplate: true });

    fetch('./templates/france.json')
      .then(response => response.json())
      .then(data => this.setState({ emojiWeatherMapTemplate: data, isLoading: false, isLoadingTemplate: false }));
  }

  render() {
    const { emojiWeatherMapTemplate, isLoading, isLoadingTemplate } = this.state;
    let content;
    
    if (isLoadingTemplate || !emojiWeatherMapTemplate) {
      content = <p>Loading map...</p>;
    } else {
      content = <EmojiWeatherMap template={emojiWeatherMapTemplate}></EmojiWeatherMap>;
    }
    return (
      <div className="App">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4 title">
              <h1> Emoji Weather Map {isLoading ? <img alt="Loading" src={LoadingImage} />
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