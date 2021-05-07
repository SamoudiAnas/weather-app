let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator--humidity>.value');
let wind = document.querySelector('.weather_indicator--wind>.value');
let pressure = document.querySelector('.weather_indicator--pressure>.value');
let image = document.querySelector('.weather_img');
let temperature = document.querySelector('.weather_temperature>.value   ');
let search = document.querySelector('.weather_search');
let forcastBlock = document.querySelector('.weather_forcast');
let suggestions = document.querySelector('#suggestions');


let weatherAPIkey = '2dc4f2c289d3249758a82fcf7b007158';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIkey;
let forcastBasePoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIkey;
let cityBaseEndPoint = 'https://api.teleport.org/api/cities/?search=';


let weatherImages = [
    {
        url: 'images/sun.png',
        ids: [800]
    },
    {
        url: 'images/cloud.png',
        ids: [803, 804]
    },
    {
        url: 'images/cloudy.png',
        ids: [801]
    },
    {
        url: 'images/wind.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    },
    {
        url: 'images/rainy.png',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url: 'images/very-cloudy.png',
        ids: [802]
    },
    {
        url: 'images/rainy.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
    },
    {
        url: 'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url: 'images/storm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    }
];

let getWeatherByCityName = async (cityString) => {
    let cityName;
    if(cityString.includes(',')){
        cityName =  cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));
    }else{
        cityName = cityString;
    }
    let endPoint = weatherBaseEndPoint + '&q=' + cityName;
    let response = await fetch(endPoint);
    if(response.status !== 200){
        alert("City wasn't found");
        return;
    }
    let weather = await response.json();
    return weather;
}


let weatherForCity = async (city) =>{
    let weather = await getWeatherByCityName(city);
    if(!weather) {
        return;
    }
    updateCurrentWeather(weather);
    let forcast = await getForcastByCityId(weather.id);
    updateForecast(forcast);
    VanillaTilt.init(document.querySelectorAll(".weather_forcast_item"));
}

let init = () =>{
    weatherForCity('Casablanca').then(()=> document.body.style.filter = 'blur(0)');
}
init();

search.addEventListener('keydown', async (e) =>{
    if(e.keyCode === 13){
        weatherForCity(search.value);
    }
});

search.addEventListener('input', async () => {
    let endPoint = cityBaseEndPoint + search.value;

    let result = await (await fetch(endPoint)).json();

    //suggestions.innerHTML = '';

    let cities = result._embedded['city:search-results'];

    let length = cities.length > 5 ? 5 : cities.length;

    for(let i = 0; i < length;i++){
        
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        
        suggestions.appendChild(option);
        
    }
    
})

let updateCurrentWeather = (data) =>{
    //name of country
    city.textContent = data.name + ', ' +data.sys.country;

    //the day 
    day.textContent = dayOfWeek();

    //humidity
    humidity.textContent = data.main.humidity;

    //wind 
    let windDirection;
    let deg = data.wind.deg;
    if(deg > 45 && deg <= 135 ){
        windDirection = 'East';
    }else if(deg > 135 && deg <= 225 ){
        windDirection = 'South';
    }else if(deg > 225 && deg <= 315 ){
        windDirection = 'West';
    }else {
        windDirection = 'North';
    }
    
    wind.textContent = windDirection  + ', ' + data.wind.speed;

    //pressure
    pressure.textContent = data.main.pressure;

    //temperature 
    temperature.textContent = data.main.temp > 0 ?  '+' + Math.round(data.main.temp) : Math.round(data.main.temp);

    //image of weather state
    let imgID = data.weather[0].id;
    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })
}


let dayOfWeek = (dt = new Date().getTime()) =>{
    return new Date(dt).toLocaleDateString('en-EN',{'weekday': 'long'});
}



let getForcastByCityId = async (id) => {
    let endPoint =  forcastBasePoint + '&id=' +id;
    let result = await fetch(endPoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];
    
    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if(hours === 12) {
            daily.push(day);
        }
    })
    return daily;
    
}


let updateForecast = (forecast) =>{
    forcastBlock.innerHTML ='';
    
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName =dayOfWeek(day.dt *1000); 
        let temp  = day.main.temp > 0 ?  '+' + Math.round(day.main.temp) : Math.round(day.main.temp);
        let forcastItem = `
            <article class="weather_forcast_item">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather_forcast_icon">
                <h3 class="weather_forcast_day">${dayName}</h3>
                <p class="weather_forcast_temperature"><span class="value">${temp}</span>&deg;C</p>
            </article> 
        `;
        forcastBlock.insertAdjacentHTML('beforeend',forcastItem);
    })

}