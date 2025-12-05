async function initMap() {

  (await google.maps.importLibrary('places'));

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

  placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
  
      const place = placePrediction.toPlace();

      await place.fetchFields({ 
          fields: ['displayName', 'location', 'formattedAddress'] 
      });

      const lat = place.location.lat();
      const lng = place.location.lng();

      const getUnit = document.getElementById('unit-toggle');
      
      // Pass ALL THREE to the next function
      fetchData(lat, lng,getUnit.value);
            
    }
  );
}

async function fetchData(lat,lng,unitSystem) {
  fetchWeatherData(lat,lng,unitSystem);
  fetchForecastData(lat,lng,unitSystem);
}

async function fetchWeatherData(lat,lng,unitSystem) {
  const apiKey = "";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${unitSystem}&exclude=minutely,hourly&appid=${apiKey}`
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
  const apiKey = "";
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=${unitSystem}&exclude=minutely,hourly&appid=${apiKey}`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    displayForecast(data,unitSystem)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayWeatherData(data,unitSystem){

  const temp = Math.round(data.main.temp)
  const feels_like = Math.round(data.main.feels_like)
  const humidity = data.main.humidity
  const temp_max =  Math.round(data.main.temp_max)
  const temp_min = Math.round(data.main.temp_min)
  const displayName = data.name

    setText("city-name", displayName);

    const symbol = unitSystem === "imperial" ? " °F" : " °C";

   setText("unit-display",symbol)

    setText("weather-desc", data.weather[0].description);

    setText("temp-display", temp );

    setText("weather-feels-like", feels_like + symbol);

    setText("temp-high", temp_max);

    setText("temp-low", temp_min);

    const iconCode = data.weather[0].icon;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function setText(elementId, text) {
    const element = document.getElementById(elementId);
    
    // Safety check: Does this ID actually exist?
    if (element) {
        element.innerText = text;
    } else {
        console.error(`Could not find element with ID: ${elementId}`);
    }
}

function displayForecast(weatherList, unitSystem) {
    const container = document.getElementById("forecast-container");
    container.innerHTML = ""; 

    const listForecast = weatherList.list
    const dailyData = listForecast.filter(reading => reading.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const temp_max = Math.round(day.main.temp_max);
        const temp_min = Math.round(day.main.temp_min);
        const symbol = unitSystem === "imperial" ? "°F" : "°C";
        const cardHTML = `
            <div class="col">
                <div class="card text-center shadow-sm h-100" style="background-color: #435465; border-radius: 15px; color: white; ">
                    <div class="card-body p-3">
                        <h5 class="card-title fw-bold mb-2">${date}</h5>
                        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" width="50">
                        <p class="display-6 fw-bold mb-0">${temp}${symbol}</p>
                        <p class="mb-0 small weather-temp">
                                        H: <span id="temp-high">${temp}</span>° 
                                        L: <span id="temp-low">${temp}s</span>°
                        </p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function success(pos){
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  const getUnit = document.getElementById('unit-toggle');
  fetchData(lat,lng,getUnit.value)

}

function error(err){
  if(err.code == 1){
    const edmontonLat = 53.5501;
    const edmontonlon = -113.4937;
    
  const getUnit = document.getElementById('unit-toggle');
    fetchData(edmontonLat,edmontonlon,getUnit.value)
  } else{
    alert("Error with getting you location")
  }
}

navigator.geolocation.getCurrentPosition(success, error)

initMap();




