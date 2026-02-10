'use strict'

class Showtime{
    constructor(showtimeId, cinema, hallId, movieTitle, time, basePrince, minPrice){
        this.showtimeId = showtimeId;
        this.cinema = cinema; // Объект Cinema
        this.hallId = hallId;
        this.movieTitle = movieTitle;
        this.time = time; // timestamp
        this.basePrince = basePrince;
        this.minPrice = minPrice;
    }
}

class Cinema{
    constructor(cinemaId, title, address, halls){
        this.cinemaId = cinemaId;
        this.title = title;
        this.address = address;
        this.halls = halls; // массив HallWithoutSeats
    }
}

class HallWithoutSeats{
    constructor(hallId, cinemaId, number, hallType){
        this.hallId = hallId;
        this.cinemaId = cinemaId;
        this.number = number;
        this.hallType = hallType;
    }
}

let port = 8000;

let showtimesByCinemaId = {};
let uniqueTimesSorted = [];

async function getShowtimes(){
    let url = `http://127.0.0.1:${port}/api/showtimes/price/${getUrlParameter('movieId')}`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok){
        let body = await response.text();
        let json = JSON.parse(body);
        let result = [];
        let uniqueTimes = new Set();
        json.forEach(showtime => {
            let hallsWithoutSeats = []
            showtime.cinema.halls.forEach(hall => {
                let hallWithoutSeats = new HallWithoutSeats(
                    parseInt(hall.hallId),
                    parseInt(hall.cinemaId),
                    parseInt(hall.number),
                    hall.hallType
                );
                hallsWithoutSeats.push(hallWithoutSeats);
            });
            let cinema = new Cinema(
                parseInt(showtime.cinema.cinemaId),
                showtime.cinema.title,
                showtime.cinema.address,
                hallsWithoutSeats
            );
            result.push(
                new Showtime(
                    parseInt(showtime.showtimeId),
                    cinema,
                    parseInt(showtime.hallId),
                    showtime.movieTitle,
                    showtime.time,
                    parseInt(showtime.basePrice),
                    parseInt(showtime.minPrice)
                )
            );

            uniqueTimes.add(showtime.time.split(' ')[0]);
        });

        uniqueTimesSorted = [...uniqueTimes];
        uniqueTimesSorted.sort((a, b) => new Date(a) - new Date(b));

        if(uniqueTimesSorted.length != 0){
            const [year, month, day] = uniqueTimesSorted[0].split('-');

            const pickr = window.flatpickr('#date__value', {
            'locale': 'ru',
            enable: uniqueTimesSorted,
            dateFormat: 'd.m.Y',
            defaultDate: `${day}.${month}.${year}`
            });
        }

        groupShowtimesByCinemaId(result);
        setShowtimes();
        document.querySelector('#date__value').onchange = setShowtimes;
    }
    else alert('Ошибка получения киносеансов');
}

function groupShowtimesByCinemaId(showtimes) {
    showtimesByCinemaId = {};
    
    showtimes.forEach(showtime => {
        const cinemaId = showtime.cinema.cinemaId;
        if (!showtimesByCinemaId[cinemaId]) showtimesByCinemaId[cinemaId] = [];
        showtimesByCinemaId[cinemaId].push(showtime);
    });
}

function setShowtimes(){
    let date = document.getElementById('date__value').value;
    if(date == '') return;
    const [day, month, year] = date.split('.');
    let dateFormatted = `${year}-${month}-${day}`;
    let container = document.querySelector('.cinema_container');
    container.innerHTML = '';
    for(let cinemaId in showtimesByCinemaId){
        let str =
        `
        <div class="cinema">
            <div class="cinema__title">${showtimesByCinemaId[cinemaId][0].cinema.title}</div>
            <div class="cinema__container">
        `;
        let count = 0;
        showtimesByCinemaId[cinemaId].forEach(showtime => {
            if(dateFormatted == showtime.time.split(' ')[0]){
                let hall = null;
                showtime.cinema.halls.forEach(elem =>{
                    if(showtime.hallId == elem.hallId) hall = elem;
                });

                str +=
                `
                <div class="cinema__show">
                    <div class="show__time">
                        <img src="img/clock.png" alt="" class="time__img">
                        <div class="time__text">${showtime.time.split(' ')[1].substring(0, 5)}</div>
                    </div>
                    <div class="show__type">${hall.hallType}</div>
                    <div class="show__price">от ${showtime.minPrice} ₽</div>
                    <div class="show__btn" data-id=${showtime.showtimeId}>Выбрать места</div>
                </div>
                `
                count++;
            }
        });
        if(count == 0) continue;
        str +=
        `
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', str);
    }

}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

getShowtimes();