'use strict';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

console.log('hello World');

class Workout {
  date = new Date();
  id;
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}
class Running extends Workout {
  type = 'Running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;

    this._calcPace();
  }
  _calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'Cycling';
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;

    this._calcSpeed();
  }
  _calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Oops Trouble getting Location');
        }
      );
    }
  }

  _loadMap(position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const userCoords = [latitude, longitude];

    this.#map = L.map('map').setView(userCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    /* L.marker(userCoords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup(); */
    /* this.#map.on('click', function (mapEvent) {
      //console.log(mapEvent);
      const { lat, lng } = mapEvent.latlng;

      L.marker([lat, lng])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            autoClose: false,
            maxWidth: 250,
            minWidth: 100,
            className: 'running-popup',
            closeOnClick: false,
          })
        )
        .setPopupContent('Workout')
        .openPopup();
    }); */
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(ev) {
    this.#mapEvent = ev;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          maxWidth: 250,
          minWidth: 100,
          className: `${workout.type}-popup`,
          closeOnClick: false,
        })
      )
      .setPopupContent(workout.type)
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="1234567890">
      <h2 class="workout__title">${workout.type} on April 14</h2>
     <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'Running' ? '🏃‍♂️' : 'Cycling'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
     </div>
     <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
     </div>`;
  }

  _newWorkout(e) {
    const inputValidilityCheck = function (...inputs) {
      return inputs.every(function (inp) {
        return Number.isFinite(inp);
      });
    };
    const positiveInputValidiltyCheck = function (...inputs) {
      return inputs.every(function (inp) {
        return inp > 0;
      });
    };
    e.preventDefault();

    const { lat, lng } = this.#mapEvent.latlng;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const type = inputType.value;
    let workout;

    if (type === 'running') {
      const cadence = Number(inputCadence.value);

      if (
        !inputValidilityCheck(distance, duration, cadence) ||
        !positiveInputValidiltyCheck(distance, duration, cadence)
      )
        return alert('Inputs should be Positive Numbers!');
      workout = new Running(distance, duration, [lat, lng], cadence);
    } else if (type === 'cycling') {
      const elevation = Number(inputElevation.value);

      if (
        !inputValidilityCheck(distance, duration, elevation) ||
        !positiveInputValidiltyCheck(distance, duration)
      )
        return alert('Inputs should be Positive Numbers!');
      workout = new Cycling(distance, duration, [lat, lng], elevation);
    }

    this._renderWorkoutMarker(workout);

    inputCadence.value =
      inputElevation.value =
      inputDistance.value =
      inputDuration.value =
        '';
  }
}

const app = new App();
