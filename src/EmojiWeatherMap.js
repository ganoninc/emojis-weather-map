import React, { Component } from 'react';
import EmojiWeatherMapRow from './EmojiWeatherMapRow';
import EmojiWeatherMapLabel from './EmojiWeatherMapLabel';
import './EmojiWeatherMap.css';

class EmojiWeatherMap extends Component {

  render () {
    return (
      <>
        <div className="EmojiWeatherMap">{
          this.props.template.rows.map( (row, index) => {
            return <EmojiWeatherMapRow key={index} row={row}></EmojiWeatherMapRow>;
          })
        }</div>
        <EmojiWeatherMapLabel name={this.props.template.name} icon={this.props.template.icon}></EmojiWeatherMapLabel>
      </>
    );
  }
}

export default EmojiWeatherMap;