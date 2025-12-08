document.addEventListener("DOMContentLoaded", async function () {
  (await google.maps.importLibrary('places'));
        let currentLat = null;
        let currentLng = null;
  const OPEMWEATHERMAP_KEY = '';

  const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
    includedPrimaryTypes: ['locality', 'administrative_area_level_3']
  });

  const searchContainer = document.getElementById('search-container');
  
  if (searchContainer) {
      searchContainer.appendChild(placeAutocomplete);
  } else {
      console.error("Error: Could not find the #search-container div!");
  }
  // Add the gmp-placeselect listener, and display the results.
  //prettier-ignore
  //@ts-ignore

        const unitToggle = document.getElementById('unit-toggle');

        unitToggle.addEventListener('change', function() {

            if (currentLat != null && currentLng != null ) {
                fetchData(currentLat, currentLng, this.value);
            }
        });

  placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
  
      const place = placePrediction.toPlace();

      await place.fetchFields({ 
          fields: ['displayName', 'location', 'formattedAddress'] 
      });

      currentLat = place.location.lat();
      currentLng = place.location.lng();

      const getUnit = document.getElementById('unit-toggle');
      await fetchData(currentLat, currentLng, getUnit.value);
            
    }
  );

async function fetchData(lat,lng,unitSystem) {
  await fetchWeatherData(lat, lng, unitSystem);
  await fetchForecastData(lat, lng, unitSystem);
}

async function fetchWeatherData(lat,lng,unitSystem) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${unitSystem}&exclude=minutely,hourly&appid=${OPEMWEATHERMAP_KEY}`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    displayWeatherData(data,unitSystem);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
async function fetchForecastData(lat,lng,unitSystem) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=${unitSystem}&exclude=minutely,hourly&appid=${OPEMWEATHERMAP_KEY}`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    displayForecast(data,unitSystem);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

    function displayWeatherData(data,unitSystem){

      const temp = Math.round(data.main.temp);
      const feels_like = Math.round(data.main.feels_like);
      const humidity = data.main.humidity;
      const temp_max =  Math.round(data.main.temp_max);
      const temp_min = Math.round(data.main.temp_min);
      const displayName = data.name;
      const sunriseDate = new Date(data.sys.sunrise * 1000);
      const sunsetDate = new Date(data.sys.sunset * 1000);

        const sunriseTimeStr = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunsetTimeStr = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const windspeed = data.wind.speed;



        setText("city-name", displayName);

        const symbol = unitSystem === "imperial" ? " °F" : " °C";

       setText("unit-display",symbol)

        setText("weather-desc", data.weather[0].description);

        setText("temp-display", temp );

        setText("weather-feels-like", feels_like + symbol);

        setText("temp-high", temp_max);

        setText("temp-low", temp_min);

        setText("sunrise-time", sunriseTimeStr);

        setText("sunset-time", sunsetTimeStr);

        const symbolSpeed = unitSystem === "imperial" ? " Mi/H" : " M/S";

        setText("windSpeed", windspeed + symbolSpeed);

        setText("humidity",humidity + "%")


        const iconCode = data.weather[0].icon;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        addCSS(data);
    }

    function setText(elementId, text) {
        const element = document.getElementById(elementId);

        if (element) {
            element.innerText = text;
        } else {
            console.error(`Could not find element with ID: ${elementId}`);
        }
    }

    function displayForecast(weatherList, unitSystem) {
        const container = document.getElementById("forecast-container");
        const template = document.getElementById("forecast-card-template");

        container.innerHTML = "";

        const listForecast = weatherList.list;

        const dailyData = listForecast.filter(reading => reading.dt_txt.includes("12:00:00"));
        const symbol = unitSystem === "imperial" ? "°F" : "°C";

        dailyData.forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: 'short' });
            const temp = Math.round(day.main.temp);
            const icon = day.weather[0].icon;
            const temp_max = Math.round(day.main.temp_max);
            const temp_min = Math.round(day.main.temp_min);

            const clone = template.content.cloneNode(true);

            clone.querySelector(".forecast-date").textContent = date;
            clone.querySelector(".forecast-icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
            clone.querySelector(".forecast-temp").textContent = `${temp}${symbol}`;
            clone.querySelector(".temp-high").textContent = temp_max;

            clone.querySelector(".temp-low").textContent = temp_min;

            container.appendChild(clone);
        });
    }

    function success(pos){
        currentLat = pos.coords.latitude;
        currentLng = pos.coords.longitude;

        const getUnit = document.getElementById('unit-toggle');
        fetchData(currentLat, currentLng, getUnit.value)

    }

    function error(err){
      if(err.code == "1"){

          const edmontonLat = 53.5501;
          const edmontonlon = -113.469;
          currentLat = edmontonLat;
          currentLng = edmontonlon;

          const getUnit = document.getElementById('unit-toggle');
          fetchData(currentLat, currentLng, getUnit.value)
      } else{
        alert("Error with getting you location")
      }
    }

        /**
         * For Getting the users geolocation
         *  OpenJavaScript - https://youtu.be/YhvLnd0ylds
         */
    navigator.geolocation.getCurrentPosition(success, error);
}
);