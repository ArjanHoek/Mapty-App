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

// GEO LOCATION
const geolocation = navigator.geolocation;
const tileLayerLink = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const onSucces = function ({ coords: { latitude, longitude } }) {
  const coords = [latitude, longitude];

  const map = L.map('map').setView(coords, 13);

  L.tileLayer(tileLayerLink, { attribution }).addTo(map);
  L.marker(coords).addTo(map).bindPopup('Your location').openPopup();
};

const onFail = function () {
  console.log('Could not get your position...');
};

if (geolocation) {
  navigator.geolocation.getCurrentPosition(onSucces, onFail);
}
