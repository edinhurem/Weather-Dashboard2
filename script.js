const weatherAPIKey = 'c9680636c1e823cd3b530a0750643b18';

window.addEventListener('load', (event) => {
  //enable the search button on the page
  let button = document.getElementById('search-button');
  button.addEventListener('click', (event) => {
    //get access to our search-city field
    let search = document.getElementById('search-city');
    SearchWeatherAPI(search.value) //run our search API
  });

  //render any previous search history
  RenderSearchButtonHistory();
});

function SearchWeatherAPI(city) {
  //first we need to get the lat and long of the city for the OneCall API
  let requestUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + weatherAPIKey;
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //take the lat and long from this resopnse and use the OneCall API for the full forecast
      let requestUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + data.coord.lat + '&lon=' + data.coord.lon + '&units=imperial&appid=' + weatherAPIKey;

      fetch(requestUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log('Fetch Response \n-------------');
          console.log(data);
          ProcessWeatherData(city, data);
        });
    });
}

/**
 * This function will process weather data after the API responds with it
 * @param {string} city - string city name that was searched
 * @param {json} data   - weather api object
 */
function ProcessWeatherData(city, data) {
  //save the city in the search history
  UpdateSearchHistory(city);

  //process the current day forecast
  RenderWeatherCurrent(city, data);

  //process the 5 day forecast
  RenderWeatherForecast(data);
}

//let weatherIcon = response.weather[0].icon;
//weatherPic.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);

/**
 * Render the HTML for the Current Weather View
 * @param {string} city - city name searched for
 * @param {json} data   - api search data
 */
function RenderWeatherCurrent(city, data) {
  document.getElementById('weather-current-cityname').innerHTML = city;
  document.getElementById('weather-current-date').innerHTML = new Date(data.current.dt*1000).toLocaleDateString('en-US');
  document.getElementById('weather-current-icon').innerHTML = '<img src="http://openweathermap.org/img/wn/' + data.current.weather[0].icon + '.png"/>';
  document.getElementById('weather-current-temperature').innerHTML = 'Temp: ' + data.current.temp + '°F';
  document.getElementById('weather-current-windspeed').innerHTML = 'Wind: ' + data.current.wind_speed + ' MPH';
  document.getElementById('weather-current-humidity').innerHTML = 'Humidity: ' + data.current.humidity + '%';
  document.getElementById('weather-current-uv').innerHTML = 'UV Index: <span class="uv-index" style="font-weight:bold; padding: 3px; border-radius: 3px; background-color: ' + UVIndexColor(data.current.uvi) + '">' + data.current.uvi + '</span>';
}

/**
 * Returns the Websafe color CSS code for the UV Index value
 * @param {float} value 
 * @returns string - css websafe color
 */
function UVIndexColor(value) {
  switch (true) {
    case (value < 3): 
      return 'green';
    case (value < 6):
      return 'yellow';
    case (value < 8):
      return 'orange';
    case (value < 11):
      return 'red';
    default:
      return 'maroon';
  }
}

/**
 * Render the HTML for the 5 day forecast Weather View
 * @param {json} data - api search data
 */
function RenderWeatherForecast(data) {
  //get access to our template and container
  let container = document.getElementById('weather-forcast-container');
  let template = document.getElementById('weather-forcast-template');

  //empty the container of any previous forecast
  container.innerHTML = '';

  //we need to do 5 days of forcasting
  //the 0 index is today included in the daily forecast so skip it
  for (x = 1; x < 6; x++) {
    //we need to clone the template to mutate it
    let temp = template.cloneNode(true);

    //modify the template with todays data
    temp.querySelector('.weather-forcast-date').innerHTML = new Date(data.daily[x].dt*1000).toLocaleDateString('en-US');
    temp.querySelector('.weather-forcast-icon').innerHTML = '<img src="http://openweathermap.org/img/wn/' + data.daily[x].weather[0].icon + '.png"/>';;
    temp.querySelector('.weather-forcast-temperature').innerHTML = 'Temp: ' + data.daily[x].temp.day + '°F';
    temp.querySelector('.weather-forcast-windspeed').innerHTML = 'Wind: ' + data.daily[x].wind_speed + ' MPH';
    temp.querySelector('.weather-forcast-humidity').innerHTML = 'Humidity: ' + data.daily[x].humidity + '%';

    //render the template to the forcast
    container.appendChild(temp);
  }
}

/**
 * Returns array of city names in our search history
 * @returns array - city names
 */
function LoadSearchHistory() {
  let data = localStorage.getItem('history');
  if (data === null) {
    //no storage or null data so make a blank array to start
    data = [];
  } else {
    //if the comma delimted data then split it up to an array
    data = data.split(',');
  }

  return data;
}

/**
 * This will update or add a city name to the search history
 * @param {string} city - city name to udate/save
 */
function UpdateSearchHistory(city) {
  //check to make sure the city is not already in the history
  let data = LoadSearchHistory();
  if (data.indexOf(city) >= 0) //-1 means not found ... 0 or higher is the index found
    return true;

  //add city to history if not already exists
  data.push(city);

  //update the history with newest data
  localStorage.setItem('history', data);

  //finally update our search button history
  RenderSearchButtonHistory();
}

/**
 * Update the city button histroy on screen to the current search history in LocalStorage
 */
function RenderSearchButtonHistory() {
  //we need to get our search history
  let data = LoadSearchHistory();

  //we need access to our container to add each button to
  let container = document.getElementById('search-button-history');
  container.innerHTML = '';

  //we need to iterate through each item and add a button for each
  for (x = 0; x < data.length; x++) {
    //create our html object to add to our container
    container.innerHTML += '<button class="btn btn-primary col-sm-12 mb-2" onclick="SearchWeatherAPI(\'' + data[x] + '\');">' + data[x] + '</button>';
  }
}
