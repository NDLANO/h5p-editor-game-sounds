import { extend } from '@services/util.js';

import './audio-button.css';

export default class AudioButton {

  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} params.dictionary Dictionary service.
   * @param {object} callbacks Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = extend({}, params );

    callbacks.onClicked = callbacks.onClicked || (() => {});

    this.dom = document.createElement('button');
    this.dom.classList.add('h5peditor-game-sounds-audio-button');
    this.dom.setAttribute('type', 'button');

    this.dom.addEventListener('click', () => {
      callbacks.onClicked();
    });

    this.togglePlaying(false);
  }

  /**
   * Set the playing state of the audio button.
   * @param {boolean} targetState True if audio is playing, false otherwise.
   * @returns {boolean} The new playing state.
   */
  togglePlaying(targetState) {
    const newState = (typeof targetState === 'boolean') ? targetState : !this.dom.classList.contains('playing');
    this.dom.setAttribute('aria-pressed', `${newState}`);
    this.dom.classList.toggle('playing', newState);

    const pauseLabel = this.params.dictionary?.get('a11y.pause') || 'Pause audio';
    const playLabel = this.params.dictionary?.get('a11y.play') || 'Play audio';

    this.dom.setAttribute('aria-label',  newState ? pauseLabel : playLabel);

    return newState;
  }

  /**
   * Get DOM element for the audio button.
   * @returns {HTMLElement} The DOM element for the audio button.
   */
  getDOM() {
    return this.dom;
  }
}
