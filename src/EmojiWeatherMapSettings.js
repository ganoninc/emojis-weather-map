import React, { Component } from 'react';
import EmojiWeatherMapSelector from './EmojiWeatherMapSelector';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";

class EmojiWeatherMapSettings extends Component {

    render() {
        const { displayLoadingIcon, onMapSelected, isLoadingTemplate } = this.props;
        
        return (
            <>
                <h1> Emoji Weather Map {displayLoadingIcon ? <img alt="Loading" src={LoadingImage} />  : ""}</h1>
                <EmojiWeatherMapSelector onMapSelected={onMapSelected} isLoadingTemplate={isLoadingTemplate}></EmojiWeatherMapSelector>
            </>
        );
    }
}

export default EmojiWeatherMapSettings;