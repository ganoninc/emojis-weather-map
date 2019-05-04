import React, { Component } from 'react';
import EmojiWeatherMapRow from './EmojiWeatherMapRow';
import './EmojiWeatherMap.css';

class EmojiWeatherMap extends Component {

  render () {
    return (
      <div className="EmojiWeatherMap">{
        this.props.template.rows.map( (row, index) => {
          return <EmojiWeatherMapRow key={index} row={row} index={index}></EmojiWeatherMapRow>;
        })
      }</div>
    );
  }
}

export default EmojiWeatherMap;