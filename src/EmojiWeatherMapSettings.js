import React, { Component } from 'react';
import EmojiWeatherMapSelector from './EmojiWeatherMapSelector';
import LoadingImage from "./EmojiWeatherMapEmojiLoading.svg";
import './EmojiWeatherMapSettings.scss';

class EmojiWeatherMapSettings extends Component {

    render() {
        const { displayLoadingIcon, onMapSelected, isLoadingTemplate } = this.props;
        
        return (
            <>
                <div className="EmojiWeatherMapSettings">
                    <h1 className="EmojiWeatherMapSettings__AppTitle">{displayLoadingIcon ? <img alt="Loading" src={LoadingImage} />  : ""} Emoji Weather Map</h1>
                    <div className="EmojiWeatherMapSettings__SettingsList">
                        <EmojiWeatherMapSelector onMapSelected={onMapSelected} isLoadingTemplate={isLoadingTemplate}></EmojiWeatherMapSelector>
                    </div>
                </div>
            </>
        );
    }
}

export default EmojiWeatherMapSettings;