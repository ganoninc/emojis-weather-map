import React, { Component } from "react";
import "../styles/EmojiWeatherMapStatus.scss";

function formatAge(now, lastUpdated) {
  const minutes = Math.floor((now - lastUpdated) / 60000);
  if (minutes < 1) {
    return "Updated just now";
  } else if (minutes < 60) {
    return "Updated " + minutes + " min ago";
  }
  return "Updated " + Math.floor(minutes / 60) + " h ago";
}

class EmojiWeatherMapStatus extends Component {
  getLocalTime() {
    const { country, timeZone, timeZoneAbbreviation, now } = this.props;
    const date = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone,
    });
    const time = now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    });

    return (
      <span
        className="EmojiWeatherMapStatus__localTime"
        title={"Local time in " + country.name + " (" + timeZone + ")"}
      >
        {country.icon} {date}, <strong>{time}</strong>{" "}
        <span className="EmojiWeatherMapStatus__timeZone">
          {timeZoneAbbreviation}
        </span>
      </span>
    );
  }

  render() {
    const { country, timeZone, now, lastUpdated, isRefreshing, onRefresh } =
      this.props;
    let refreshLabel;

    if (isRefreshing) {
      refreshLabel = "Updating…";
    } else if (lastUpdated) {
      refreshLabel = formatAge(now, lastUpdated);
    } else {
      refreshLabel = "Weather unavailable, retry";
    }

    return (
      <div className="EmojiWeatherMapStatus">
        {country && timeZone && this.getLocalTime()}
        {country && (
          <button
            type="button"
            className="EmojiWeatherMapStatus__refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh the weather"
          >
            {refreshLabel}
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
        )}
      </div>
    );
  }
}

export default EmojiWeatherMapStatus;
