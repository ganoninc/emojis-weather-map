import React, { Component } from "react";
import "../styles/EmojiWeatherMapStatus.scss";

class EmojiWeatherMapStatus extends Component {
  render() {
    const { lastUpdated, isRefreshing, onRefresh } = this.props;
    const today = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="EmojiWeatherMapStatus">
        <span className="EmojiWeatherMapStatus__date">{today}</span>
        {(lastUpdated || !isRefreshing) && (
          <span className="EmojiWeatherMapStatus__lastUpdated">
            {lastUpdated
              ? "Last updated at " +
                lastUpdated.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Weather unavailable"}
            <button
              type="button"
              className="EmojiWeatherMapStatus__refresh"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh the weather"
              aria-label="Refresh the weather"
            >
              <span
                className={
                  isRefreshing
                    ? "EmojiWeatherMapStatus__refreshIcon EmojiWeatherMapStatus__refreshIcon--spinning"
                    : "EmojiWeatherMapStatus__refreshIcon"
                }
                aria-hidden="true"
              >
                ↻
              </span>
            </button>
          </span>
        )}
      </div>
    );
  }
}

export default EmojiWeatherMapStatus;
