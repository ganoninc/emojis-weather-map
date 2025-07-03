import React, { Component } from "react";

class EmojiWeatherMapSelector extends Component {
  constructor(props) {
    super(props);

    this.templateBaseUrl = process.env.PUBLIC_URL + "/templates/";

    this.state = {
      selectedTemplate: "france.json",
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const selectedTemplate = event.target.value;
    const selectedMapTemplateURL = this.templateBaseUrl + selectedTemplate;

    this.setState((_) => {
      this.props.onMapSelected(selectedMapTemplateURL);
      return { selectedTemplate };
    });
  }

  componentDidMount() {
    const { selectedTemplate } = this.state;
    const selectedMapTemplateURL = this.templateBaseUrl + selectedTemplate;
    this.props.onMapSelected(selectedMapTemplateURL);
  }

  render() {
    const { isLoadingTemplate } = this.props;

    return (
      <div className="EmojiWeatherMapSelector">
        <div className="form-group row">
          <label htmlFor="mapSelector" className="col-12 col-form-label">
            Selected country:
          </label>
          <div className="col-12">
            <select
              disabled={isLoadingTemplate}
              value={this.state.selectedTemplate}
              onChange={this.handleChange}
              className="form-control"
              id="mapSelector"
              name="mapSelector"
            >
              <option value="france.json">🇫🇷 France</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default EmojiWeatherMapSelector;
