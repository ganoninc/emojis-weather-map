import React, { Component } from 'react';
import EmojiWeatherMapRow from './EmojiWeatherMapRow';
import EmojiWeatherMapLabel from './EmojiWeatherMapLabel';
import './EmojiWeatherMap.scss';

class EmojiWeatherMap extends Component {

  render () {
    return (
      <>
        <div className="emojiWeatherMap">{
          this.props.template.rows.map( (row, index) => {
            return <EmojiWeatherMapRow key={index} row={row} onLoading={this.props.onLoading} onLoaded={this.props.onLoaded}></EmojiWeatherMapRow>;
          })
        }</div>
        <EmojiWeatherMapLabel name={this.props.template.name} icon={this.props.template.icon}></EmojiWeatherMapLabel>
      </>
    );
  }
}

export default EmojiWeatherMap;