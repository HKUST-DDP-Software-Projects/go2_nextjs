import React, { useState, useRef, useEffect } from "react";

type AutocompleteProps<T> = {
  options: T[];
  // eslint-disable-next-line no-unused-vars
  onSelect: (option: T) => void;
  label: string;
  placeholder: string;
  // eslint-disable-next-line no-unused-vars
  displayOption: (option: T) => string;
  clearOnSelect?: boolean;
};

function Autocomplete<T>({
  options,
  onSelect,
  label,
  placeholder,
  displayOption,
  clearOnSelect = false,
}: AutocompleteProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const resultsRef = useRef<HTMLUListElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const results = options.filter((option) =>
      displayOption(option)
        .toLowerCase()
        .includes(event.target.value.toLowerCase()),
    );
    setSearchResults(results);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prevIndex) =>
        prevIndex === searchResults.length - 1 ? 0 : prevIndex + 1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prevIndex) =>
        prevIndex === 0 ? searchResults.length - 1 : prevIndex - 1,
      );
    } else if (event.key === "Enter" && activeIndex !== -1) {
      event.preventDefault();

      setSearchTerm(
        clearOnSelect ? "" : displayOption(searchResults[activeIndex]),
      );
      setSearchResults([]);
      onSelect(searchResults[activeIndex]);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (activeIndex !== -1 && resultsRef.current) {
      const activeElement = resultsRef.current.children[
        activeIndex
      ] as HTMLElement;
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="mb-4 relative">
      <label
        htmlFor="autocomplete"
        className="block text-gray-700 font-medium mb-2"
      >
        {label}
      </label>
      <input
        type="text"
        id="autocomplete"
        name="autocomplete"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setTimeout(() => {
            setSearchResults([]);
          }, 200);
        }}
        onFocus={handleSearchChange}
        placeholder={placeholder}
        className="border border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={searchResults.length > 0}
        aria-owns="autocomplete-results"
        aria-autocomplete="list"
        aria-controls="autocomplete-results"
      />
      {searchResults.length > 0 && (
        <ul
          id="autocomplete-results"
          className="absolute z-10 bg-white border border-gray-300 mt-1 overflow-y-scroll h-48 w-full"
          role="listbox"
          ref={resultsRef}
        >
          {searchResults.map((option, index) => (
            <li
              key={displayOption(option)}
              className={`px-4 py-2 cursor-pointer w-full ${
                index === activeIndex ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                setSearchTerm(clearOnSelect ? "" : displayOption(option));
                setSearchResults([]);
                onSelect(option);
                setActiveIndex(-1);
              }}
              onMouseOver={() => setActiveIndex(index)}
              role="option"
              aria-selected={index === activeIndex}
            >
              {displayOption(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
