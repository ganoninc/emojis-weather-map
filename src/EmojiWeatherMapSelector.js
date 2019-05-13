import React, { Component } from 'react';

class EmojiWeatherMapSelector extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            value: './templates/france.json'
         };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        let selectedMapTemplateURL = event.target.value;
        this.setState((state, props) => {
            props.onMapSelected(selectedMapTemplateURL);
            return { value: selectedMapTemplateURL };
        });
    }

    componentDidMount() {
        const { value } = this.state;
        this.props.onMapSelected(value);
    }

    render() {
        const { isLoadingTemplate } = this.props;
        let selectorDisabled = isLoadingTemplate;
        
        return (
            <>
                <div class="form-group row">
                    <label for="mapSelector" className="col-sm-3 col-form-label">Country</label>
                    <div class="col-sm-9">
                        <select disabled={selectorDisabled} value={this.state.value} onChange={this.handleChange} className="form-control" id="mapSelector">
                            <option value="./templates/france.json">France</option>
                            {/* <option value="./templates/francetest.json">Test</option> */}
                        </select>
                    </div>
                </div>
            </>
        );
    }
}

export default EmojiWeatherMapSelector;