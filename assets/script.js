$(window).on('load', function () {
    // currentLocation();
    checkLocal();
});

// ** API Key for all of the weather data **
var APIKey = "09e0d7e534e41ce68ba5f2577fa5f760";
var q = "";
var now = moment();

// sets the Date and time format for header
var currentDate = now.format('MMMM Do YYYY || h:mm a');
$("#currentDay").text(currentDate);

// Function that searchs onclick
$("#search-button").on("click", function (event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();

    q = $("#city-input").val();
    if (q === '') {
        return alert('Please Enter Valid City Name ! ');
    }
    getDetails(q);

    saveLocal(q);
});

// Function to create Button for searched cities
function createBtn(q) {
    var newLi = $("<li>")
    var newBtn = $('<button>');
    //Adding Extra ID for Button to stop Creating Duplicate Button on Click
    newBtn.attr('id', 'extraBtn');
    newBtn.addClass("button is-small recentSearch btn");
    newBtn.text(q);
    newLi.append(newBtn)
    $("#historyList").prepend(newLi);
    //setting click function to prevent duplicate button
    $("#extraBtn").on("click", function () {
        var newQ = $(this).text();
        getDetails(newQ);
    });
}

// Function that converts temperature F to C
function convertToC(fahrenheit) {
    var fTempVal = fahrenheit;
    var cTempVal = (fTempVal - 32) * (5 / 9);
    var celcius = Math.round(cTempVal * 10) / 10;
    return celcius;
}

// Function to get weather details 
function getDetails(q) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + q + "&units=imperial&appid=" + APIKey;
    $.ajax({
        // gets the current weather info
        url: queryURL,
        method: "GET",
        error: (err => { //If API through error then alert 
            alert("Your city was not found. Check your spelling or enter a city code")
            return;
        })
    }).then(function (response) {
        console.log(response)
        //to avoid repeating city information on button click 
        $(".cityList").empty()
        $("#days").empty()
        var celcius = convertToC(response.main.temp);
        var cityMainOne = $("<div col-12>").append($("<p><h2>" + response.name + ' (' + currentDate + ')' + "</h2><p>"));
        var image = $('<img class="imgsize">').attr('src', 'http://openweathermap.org/img/w/' + response.weather[0].icon + '.png');
        var degreeMain = $('<p>').text('Temperature : ' + response.main.temp + ' °F (' + celcius + '°C)');
        var humidityMain = $('<p>').text('Humidity : ' + response.main.humidity + '%');
        var windMain = $('<p>').text('Wind Speed : ' + response.wind.speed + 'MPH');
        var uvIndexcoord = '&lat=' + response.coord.lat + '&lon=' + response.coord.lon;
        var cityId = response.id;

        displayUVindex(uvIndexcoord);
        displayWeather(cityId);

        cityMainOne.append(image).append(degreeMain).append(humidityMain).append(windMain);
        $('#cityList').empty();
        $('#cityList').append(cityMainOne);
    });
}

// Function that gets the UV index
function displayUVindex(uv) {
    $.ajax({ // gets the UV index info
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + uv,
        method: "GET"
    }).then(function (response) {
        var UVIndex = $("<p><span>");
        UVIndex.attr("class", "badge badge-danger");
        UVIndex.text(response.value);
        $("#cityList").append('UV-Index : ').append(UVIndex);
    });
}

// Function that displays the forecast
function displayWeather(c) {
    $.ajax({ // gets the 5 day forecast API
        url: "https://api.openweathermap.org/data/2.5/forecast?id=" + c + "&units=imperial&APPID=" + APIKey,
        method: "GET",
    }).then(function (response) {
        //  Parse response to display forecast for next 5 days underneath current conditions
        var arrayList = response.list;
        for (var i = 0; i < arrayList.length; i++) {
            if (arrayList[i].dt_txt.split(' ')[1] === '12:00:00') {
                console.log(arrayList[i]);
                var celcius = convertToC(arrayList[i].main.temp);//converting F to Celsius 
                var cityMain = $('<div>');
                cityMain.addClass('col forecast bg-success text-white ml-3 mb-3 rounded>');
                var date5 = $("<h5>").text(response.list[i].dt_txt.split(" ")[0]);
                var image = $('<img>').attr('src', 'http://openweathermap.org/img/w/' + arrayList[i].weather[0].icon + '.png');
                var degreeMain = $('<p>').text('Temp : ' + arrayList[i].main.temp + ' °F (' + celcius + '°C)');
                var humidityMain = $('<p>').text('Humidity : ' + arrayList[i].main.humidity + '%');
                var windMain = $('<p>').text('Wind Speed : ' + arrayList[i].wind.speed + 'MPH');
                cityMain.append(date5).append(image).append(degreeMain).append(humidityMain).append(windMain);
                $('#days').append(cityMain);
            }
        }
    });
};

// Function that gets local storage
function checkLocal() {
    var storedData = localStorage.getItem('queries');
    var dataArray = [];
    if (!storedData) {
        console.log("no data stored");
    } else {
        storedData.trim();
        dataArray = storedData.split(',');
        for (var i = 0; i < dataArray.length; i++) {
            createBtn(dataArray[i]);
        }
    }
};
// Function that saves to local storage
function saveLocal(q) {
    var data = localStorage.getItem('queries');
    if (data) {
        console.log(data, q)

    } else {
        data = q;
        localStorage.setItem('queries', data);
    }
    if (data.indexOf(q) === -1) {
        data = data + ',' + q;
        localStorage.setItem('queries', data);
        createBtn(q);
    }
}

// Function that clears history onclick
$("#clear-history").on("click", function (event) {
    $("#historyList").empty();
});