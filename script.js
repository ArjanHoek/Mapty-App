'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const formElements = [
  {
    element: inputDistance,
    convertToNum: true,
    shouldBePositive: true,
  },
  {
    element: inputDuration,
    convertToNum: true,
    shouldBePositive: true,
  },
  {
    element: inputCadence,
    convertToNum: true,
    shouldBePositive: true,
    types: ['running'],
  },
  {
    element: inputElevation,
    convertToNum: true,
    shouldBePositive: false,
    types: ['cycling'],
  },
];

// WORKOUT ARCHITECTURE
class Workout {
  date = new Date();
  id = +new Date();

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // km
    this.duration = duration; // minutes
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// APPLICATION ARCHITECTURE
class App {
  _map;
  _mapEvent;
  _mapZoomLevel = 13;
  _tileLayer;
  _attribution;
  _workouts = [];

  constructor(tileLayer, attribution) {
    this._tileLayer = tileLayer;
    this._attribution = attribution;

    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._centerWorkout.bind(this));
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

  _centerWorkout({ target }) {
    const el = target.closest('.workout');

    if (!el) return;

    const { coords } = this._workouts.find(({ id }) => id === +el.dataset.id);

    this._map.setView(coords, this._mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _loadMap({ coords: { latitude, longitude } }) {
    this._map = L.map('map');

    L.tileLayer(this._tileLayer, { attribution: this._attribution }).addTo(
      this._map
    );

    this._map.setView([latitude, longitude], this._mapZoomLevel);

    this._map.on('click', this._showForm.bind(this));
  }

  _renderWorkoutMarker({ type, coords, description }) {
    const content = `${type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${description}`;
    const popupOptions = {
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `${type}-popup`,
    };

    const popup = L.popup(popupOptions).setContent(content);

    L.marker(coords).addTo(this._map).bindPopup(popup).openPopup();
  }

  _renderWorkout({
    type,
    distance,
    duration,
    cadence,
    elevation,
    speed,
    pace,
    id,
    description,
  }) {
    let variableHtml;

    if (type === 'running') {
      variableHtml = `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
      `;
    }

    if (type === 'cycling') {
      variableHtml = `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${elevation}</span>
        <span class="workout__unit">m</span>
      </div>
      `;
    }

    const html = `
    <li class="workout workout--${type}" data-id="${id}">
      <h2 class="workout__title">${description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
        <span class="workout__value">${distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${duration}</span>
        <span class="workout__unit">min</span>
      </div>
      ${variableHtml}
    </li>
    `;

    form.insertAdjacentHTML('afterend', html);
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

  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');

    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevationField() {
    const hidden = 'form__row--hidden';

    inputCadence.parentElement.classList.toggle(hidden);
    inputElevation.parentElement.classList.toggle(hidden);
  }

  _isNum(num) {
    return Number.isFinite(num);
  }

  _isPositive(num) {
    return num > 0;
  }

  _validate(input) {
    const { name, value, shouldBePositive } = input;
    const isValid = shouldBePositive ? this._isPositive(value) : true;
    return { value, name, isValid };
  }

  _format(input) {
    const {
      element: { name, value: inputValue },
      convertToNum,
      shouldBePositive,
    } = input;
    const value = convertToNum ? +inputValue : inputValue;
    return { name, value, shouldBePositive };
  }

  _getFormInput() {
    const type = inputType.value;

    const input = formElements.reduce((acc, cur) => {
      const formatted = this._format(cur);

      const include = cur.types ? cur.types.includes(type) : true;

      return include
        ? { ...acc, [cur.element.name]: this._validate(formatted) }
        : { ...acc };
    }, {});

    return { ...input, type: { name: type, isValid: true } };
  }

  _newWorkout(e) {
    e.preventDefault();
    const input = this._getFormInput();
    const { cadence, distance, duration, elevation, type } = input;

    // Validate data
    const isValid = Object.values(input).every(({ isValid }) => isValid);
    if (!isValid) return alert('Input is invalid!');

    let workout;
    const { lat, lng } = this._mapEvent.latlng;

    if (type.name === 'running') {
      workout = new Running(
        [lat, lng],
        ...[distance, duration, cadence].map(i => i.value)
      );
    }

    if (type.name === 'cycling') {
      workout = new Cycling(
        [lat, lng],
        ...[distance, duration, elevation].map(i => i.value)
      );
    }

    this._workouts.push(workout);

    console.log(this._workouts);

    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);

    this._clearForm();
    this._hideForm();
  }
}

const app = new App(
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
);
