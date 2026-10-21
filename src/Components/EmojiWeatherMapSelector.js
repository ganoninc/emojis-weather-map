import React, { useEffect, useState } from "react";
import { useCombobox } from "downshift";
import countries from "../countries.json";
import "../styles/EmojiWeatherMapSelector.scss";

const templateBaseUrl = process.env.PUBLIC_URL + "/templates/";
const defaultCountry = countries.find(
  (country) => country.template === "france.json"
);

// Other names people may type to find a country.
const aliases = {
  "united-states-of-america.json": ["USA", "US", "America"],
  "united-kingdom.json": ["UK", "Great Britain", "England", "Scotland", "Wales"],
  "united-arab-emirates.json": ["UAE"],
  "netherlands.json": ["Holland"],
  "czechia.json": ["Czech Republic"],
  "ivory-coast.json": ["Cote d'Ivoire"],
  "myanmar.json": ["Burma"],
  "eswatini.json": ["Swaziland"],
  "democratic-republic-of-the-congo.json": ["DRC", "Congo-Kinshasa"],
  "republic-of-the-congo.json": ["Congo-Brazzaville"],
};

const { stateChangeTypes } = useCombobox;

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function countryToString(country) {
  return country ? country.icon + " " + country.name : "";
}

// Countries matching the query: names starting with it first, then names
// with a word starting with it, then names containing it.
function filterCountries(query) {
  const search = normalize(query.trim());
  if (!search) {
    return countries;
  }

  const matches = [];
  countries.forEach((country) => {
    const names = [country.name, ...(aliases[country.template] || [])].map(
      normalize
    );
    let rank = null;
    if (names.some((name) => name.startsWith(search))) {
      rank = 0;
    } else if (
      names.some((name) =>
        name.split(/[\s-]+/).some((word) => word.startsWith(search))
      )
    ) {
      rank = 1;
    } else if (names.some((name) => name.includes(search))) {
      rank = 2;
    }
    if (rank !== null) {
      matches.push({ country, rank });
    }
  });
  return matches
    .sort((a, b) => a.rank - b.rank)
    .map((match) => match.country);
}

function EmojiWeatherMapSelector({ onMapSelected, isLoadingTemplate }) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [query, setQuery] = useState("");
  const items = filterCountries(query);

  useEffect(() => {
    onMapSelected(templateBaseUrl + selectedCountry.template);
  }, [selectedCountry, onMapSelected]);

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getInputProps,
    getMenuProps,
    getItemProps,
    openMenu,
  } = useCombobox({
    items,
    selectedItem: selectedCountry,
    itemToString: countryToString,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSelectedCountry(selectedItem);
      }
    },
    // Only what the user types filters the list, not the selected name.
    onInputValueChange: ({ type, inputValue }) =>
      setQuery(type === stateChangeTypes.InputChange ? inputValue : ""),
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        // Opening the list empties the field, so the user can type right
        // away and sees every country.
        case stateChangeTypes.InputClick:
        case stateChangeTypes.FunctionOpenMenu:
          return { ...changes, isOpen: true, inputValue: "" };
        // Typing highlights the best match, so Enter picks it.
        case stateChangeTypes.InputChange:
          return { ...changes, highlightedIndex: 0 };
        // Leaving without choosing keeps the current country.
        case stateChangeTypes.InputBlur:
        case stateChangeTypes.InputKeyDownEscape:
          return {
            ...changes,
            isOpen: false,
            selectedItem: state.selectedItem,
            inputValue: countryToString(state.selectedItem),
          };
        default:
          return changes;
      }
    },
  });

  return (
    <div className="EmojiWeatherMapSelector">
      <div className="form-group row">
        <label {...getLabelProps({ className: "col-12 col-form-label" })}>
          Country
        </label>
        <div className="col-12 EmojiWeatherMapSelector__field">
          <input
            {...getInputProps({
              disabled: isLoadingTemplate,
              className: "form-control",
              onFocus: () => {
                if (!isOpen) {
                  openMenu();
                }
              },
            })}
          />
          <ul
            {...getMenuProps({
              className:
                "EmojiWeatherMapSelector__menu" +
                (isOpen ? " EmojiWeatherMapSelector__menu--open" : ""),
            })}
          >
            {isOpen &&
              items.map((country, index) => (
                <li
                  key={country.template}
                  {...getItemProps({
                    item: country,
                    index,
                    className:
                      "EmojiWeatherMapSelector__item" +
                      (highlightedIndex === index
                        ? " EmojiWeatherMapSelector__item--highlighted"
                        : "") +
                      (country === selectedCountry
                        ? " EmojiWeatherMapSelector__item--selected"
                        : ""),
                  })}
                >
                  {countryToString(country)}
                </li>
              ))}
            {isOpen && items.length === 0 && (
              <li className="EmojiWeatherMapSelector__empty">
                No country found
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EmojiWeatherMapSelector;
