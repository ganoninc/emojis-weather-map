import React, { Component } from 'react';

class EmojiWeatherMapLabel extends Component {

    render() {
        return (
            <h2>{this.props.icon} {this.props.name}</h2>
        );
    }
}

export default EmojiWeatherMapLabel;