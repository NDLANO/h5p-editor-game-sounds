import blip from '@assets/audios/blip.mp3';
import eehEeh from '@assets/audios/eeh-eeh.mp3';
import hurry from '@assets/audios/hurry.mp3';
import knioy from '@assets/audios/knioy.mp3';
import lost from '@assets/audios/lost.mp3';
import ohNo from '@assets/audios/oh-no.mp3';
import padimPadim from '@assets/audios/padim-padim.mp3';
import pling from '@assets/audios/pling.mp3';
import sunrise from '@assets/audios/sunrise.mp3';
import yoink from '@assets/audios/yoink.mp3';

import AudioButton from '@components/audio-button.js';
import MediaSelect from '@components/media-select.js';
import Dictionary from '@services/dictionary.js';
import { callOnceVisible } from '@services/util.js';

import '@styles/h5p-editor-game-sounds.css';

/** @constant {Map<string, string>} MEDIA_FILE_MAP Mapping of media IDs to file URL data */
const MEDIA_FILE_MAP = new Map([
  ['blip', blip],
  ['eehEeh', eehEeh],
  ['hurry', hurry],
  ['knioy', knioy],
  ['lost', lost],
  ['ohNo', ohNo],
  ['padimPadim', padimPadim],
  ['pling', pling],
  ['sunrise', sunrise],
  ['yoink', yoink],
]);

export default class GameSounds extends H5P.EventDispatcher {

  /**
   * @class
   */
  constructor() {
    super();

    this.dictionary = new Dictionary();
    this.fillDictionary();

    this.dom = this.buildDOM();

    callOnceVisible(this.dom, () => {
      this.updateSelectedSound(this.mediaSelect.getValue());
    });
  }

  /**
   * Fill Dictionary.
   */
  fillDictionary() {
    // Convert H5PEditor language strings into object.
    const plainTranslations =
      H5PEditor.language['H5PEditor.GameSounds'].libraryStrings || {};
    const translations = {};

    for (const key in plainTranslations) {
      let current = translations;
      // Assume string keys separated by . or / for defining path
      const splits = key.split(/[./]+/);
      const lastSplit = splits.pop();

      // Create nested object structure if necessary
      splits.forEach((split) => {
        if (!current[split]) {
          current[split] = {};
        }
        current = current[split];
      });

      // Add translation string
      current[lastSplit] = plainTranslations[key];
    }

    this.dictionary.fill(translations);
  }

  /**
   * Build the DOM structure for the widget.
   * @returns {HTMLElement} The DOM structure for the widget.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5peditor-game-sounds');

    const labelUUID = H5P.createUUID();
    const label = this.buildLabel(labelUUID);
    dom.appendChild(label);

    const flex = document.createElement('div');
    flex.classList.add('h5peditor-game-sounds-flex');
    dom.appendChild(flex);

    this.mediaSelect = this.buildMediaSelect(labelUUID);
    this.mediaSelect.reset();
    flex.appendChild(this.mediaSelect.getDOM());

    if (this.mediaSelect.getSize() > 0) {
      this.audioButton = this.buildAudioButton();
      flex.appendChild(this.audioButton.getDOM());
    }

    return dom;
  }

  /**
   * Build a label element.
   * @param {string} labelUUID UUID of the label element.
   * @returns {HTMLElement} The label element.
   */
  buildLabel(labelUUID) {
    const label = document.createElement('label');
    label.classList.add('h5peditor-label');
    label.setAttribute('id', labelUUID);
    label.textContent = this.dictionary.get('selectAudio');

    return label;
  }

  /**
   * Build a media select element.
   * @param {string} labelUUID UUID of the label element.
   * @returns {MediaSelect} The media select element.
   */
  buildMediaSelect(labelUUID) {
    const selectOptions = Array.from(MEDIA_FILE_MAP.keys()).map((key) => ({
      value: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));

    return new MediaSelect(
      {
        options: selectOptions,
        descriptionUUID: labelUUID,
      },
      {
        onChanged: (value) => {
          this.updateSelectedSound(value);
        },
      },
    );
  }

  /**
   * Build an audio button element.
   * @returns {AudioButton} The audio button element.
   */
  buildAudioButton() {
    return new AudioButton(
      {
        dictionary: this.dictionary,
      },
      {
        onClicked: () => {
          this.audioButton.togglePlaying(true);
          this.playAudio(
            this.mediaSelect.getValue(),
            () => {
              this.audioButton.togglePlaying(false);
            },
          );
        },
      },
    );
  }

  /**
   * Update selected sound by id.
   * @param {string} id Sound id.
   */
  updateSelectedSound(id) {
    if (!MEDIA_FILE_MAP.has(id)) {
      return;
    }

    this.medium = this.dataUrlToMedia(MEDIA_FILE_MAP.get(id), 'game-sound');
    this.trigger('hasMedia', true);
  }

  /**
   * Convert data URL to Blob.
   * @param {string} dataUrl Data URL string.
   * @param {string} prefix Prefix for the filename.
   * @returns {object} Media object with data (Blob) and filename with proper extension.
   */
  dataUrlToMedia(dataUrl, prefix) {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);

    if (!mimeMatch) {
      throw new Error('Invalid data URL format');
    }

    const mime = mimeMatch[1];
    const mimeToExt = {
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
    };
    const suffix = mimeToExt[mime] || 'unknown';

    const bstr = atob(parts[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return {
      data: new Blob([u8arr], { type: mime }),
      name: `${prefix}.${suffix}`,
    };
  }

  /**
   * Play audio by id.
   * @param {string} id Audio id.
   * @param {function} callback Callback when audio ends.
   */
  playAudio(id, callback) {
    if (!MEDIA_FILE_MAP.has(id)) {
      return;
    }

    this.stopAudio();

    this.audio = new Audio(MEDIA_FILE_MAP.get(id));
    this.audio.onended = () => {
      callback?.();
    };

    this.audio.onerror = () => {
      console.error(`Failed to play audio: ${id}`);
      this.audioButton?.togglePlaying(false);
    };

    this.audio.play().catch((error) => {
      console.error('Audio playback failed:', error);
      this.audioButton?.togglePlaying(false);
    });
  }

  /**
   * Stop audio playback.
   */
  stopAudio() {
    if (!this.audio || this.audio.paused) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audioButton?.togglePlaying(false);
  }

  /**
   * Append the widget to a container. Required by H5PEditor.AV widget interface.
   * @param {HTMLElement} container Container to append the widget to.
   */
  appendTo(container) {
    container.appendChild(this.dom);
  }

  /**
   * Determine whether the widget has media set. Required by H5PEditor.AV widget interface.
   * @returns {boolean} True if media is set, false otherwise.
   */
  hasMedia() {
    return !!this.medium;
  }

  /**
   * Get the media object. Required by H5PEditor.AV widget interface.
   * @returns {object} Media object with data (Blob) and filename with proper extension.
   */
  getMedia() {
    return this.medium;
  }

  /**
   * Pause whatever the widget is doing. Required by H5PEditor.AV widget interface.
   */
  pause() {
    this.stopAudio();
  }

  /**
   * Reset the widget to its initial state. Required by H5PEditor.AV widget interface.
   */
  reset() {
    this.stopAudio();
    delete this.medium;
    this.trigger('hasMedia', false);

    this.mediaSelect.reset();
  }
}
