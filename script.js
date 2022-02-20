'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  _map;
  _mapEvent;
  _tileLayer;

  constructor(tileLayer, attribution) {
    this._tileLayer = tileLayer;
    this._attribution = attribution;

    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log('Could not get your position...');
        }
      );
    }
  }

  _loadMap({ coords: { latitude, longitude } }) {
    this._map = L.map('map');

    L.tileLayer(this._tileLayer, { attribution: this._attribution }).addTo(
      this._map
    );

    this._map.setView([latitude, longitude], 13);

    this._map.on('click', this._showForm.bind(this));
  }

  _addMarker() {
    const content = `<p>${'text here'}</p>`;
    const popupOptions = {
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: 'running-popup',
    };

    const popup = L.popup(popupOptions).setContent(content);

    L.marker(this._mapEvent.latlng)
      .addTo(this._map)
      .bindPopup(popup)
      .openPopup();
  }

  _showForm(e) {
    this._mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _clearForm() {
    const formElements = [
      inputDistance,
      inputDuration,
      inputCadence,
      inputElevation,
    ];

    formElements.forEach(el => (el.value = ''));
  }

  _toggleElevationField() {
    const hidden = 'form__row--hidden';

    inputCadence.parentElement.classList.toggle(hidden);
    inputElevation.parentElement.classList.toggle(hidden);
  }

  _newWorkout(e) {
    e.preventDefault();
    this._clearForm();
    this._addMarker();
  }
}

const app = new App(
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
);
