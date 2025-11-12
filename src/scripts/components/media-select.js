import './media-select.css';

export default class Select {

  /**
   * @class
   * @param {object} params Parameters.
   * @param {Array} params.options Options for the select.
   * @param {string} params.descriptionUUID UUID of the element describing the select for accessibility.
   * @param {object} callbacks Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    if (!Array.isArray(params.options)) {
      params.options = [];
    }

    callbacks.onChanged = callbacks.onChanged || (() => {});

    this.dom = document.createElement('div');
    this.dom.classList.add('h5peditor-game-sounds-select-wrapper');

    this.select = document.createElement('select');
    this.select.classList.add('h5peditor-game-sounds-select');

    if (params.descriptionUUID) {
      this.select.setAttribute('aria-describedby', params.descriptionUUID);
    }

    params.options.forEach((option) => {
      const optionDOM = document.createElement('option');
      optionDOM.value = option.value;
      optionDOM.textContent = option.label;
      this.select.appendChild(optionDOM);
    });

    this.select.addEventListener('change', (event) => {
      callbacks.onChanged(event.target.value);
    });

    this.dom.appendChild(this.select);
  }

  /**
   * Get the DOM element for the media select.
   * @returns {HTMLElement} The DOM element for the media select.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get the selected value.
   * @returns {string} The selected value.
   */
  getValue() {
    return this.select.value;
  }

  /**
   * Get the number of options in the select.
   * @returns {number} The number of options.
   */
  getSize() {
    return this.select.options.length;
  }

  /**
   * Reset the select to its initial state.
   */
  reset() {
    if (this.select.options.length) {
      this.select.selectedIndex = 0;
      this.select.dispatchEvent(new Event('change'));
    }
  }
}
