import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import EmojiWeatherMapFactory from './EmojiWeatherMapFactory'


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emojiWeatherMapTemplate: null,
      isLoading: false
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    fetch('./templates/france.json')
      .then(response => response.json())
      .then(data => this.setState({ emojiWeatherMapTemplate: data, isLoading: false }));
  }

  render() {
    const { emojiWeatherMapTemplate, isLoading } = this.state;
    
    if(isLoading || !emojiWeatherMapTemplate) {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Loading template...
            </p>
          </header>
        </div>
      );
    } else {
      const emojiWeatherMap = EmojiWeatherMapFactory.build(emojiWeatherMapTemplate);
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Template loaded!
            </p>
          </header>
        </div>
      );
    }
  }
}

export default App;
