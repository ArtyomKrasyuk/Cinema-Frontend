'use strict'

class Showtime{
    constructor(showtimeId, cinema, hallId, movieTitle, time, basePrince){
        this.showtimeId = showtimeId;
        this.cinema = cinema;
        this.hallId = hallId;
        this.movieTitle = movieTitle;
        this.time = time;
        this.basePrince = basePrince;
    }
}

class Cinema{
    constructor(cinemaId, title, address, halls){
        this.cinemaId = cinemaId;
        this.title = title;
        this.address = address;
        this.halls = halls;
    }
}

class HallWithoutSeats{
    constructor(hallId, cinemaId, number){
        this.hallId = hallId;
        this.cinemaId = cinemaId;
        this.number = number;
    }
}

let port = 8000;

let cinemas = [];

let showtimes = [];


let add = document.querySelector('.main__btn');
let overlay = document.querySelector('.overlay');
let exit = document.querySelector('.form__exit');
let formAdd = document.getElementById('form__add_btn');
let formChange = document.getElementById('form__change_btn');
let formId = document.getElementById('form__showtime_id');

let movieTitleInput = document.getElementById('movie_title');
let cinemaSelect = document.getElementById('cinema_select');
let hallSelect = document.getElementById('hall_select');
let dateInput = document.getElementById('date');
let timeInput = document.getElementById('time');
let priceInput = document.getElementById('price');
let hallSubtitle = document.getElementById('hall_subtitle');

add.onclick = function(e){
    movieTitleInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
    priceInput.value = '';
    cinemaSelect.value = '-1';
    hallSelect.style.display = 'none';
    hallSubtitle.style.display = 'none';

    formId.innerHTML = '';
    formAdd.style.display = 'block';
    formChange.style.display = 'none';
    overlay.style.display = 'block';
}

exit.onclick = function(e){
    overlay.style.display = 'none';
}

async function entrypoint() {
    getCinemas();
    setButtons();
}

async function getCinemas(){
    let url = `http://127.0.0.1:${port}/api/cinemas`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok){
        let body = await response.text();
        let json = JSON.parse(body);
        cinemas = [];
        json.forEach(cinema => {
            let hallsWithoutSeats = []
            cinema.halls.forEach(hall => {
                let hallWithoutSeats = new HallWithoutSeats(
                    parseInt(hall.hallId),
                    parseInt(hall.cinemaId),
                    parseInt(hall.number)
                );
                hallsWithoutSeats.push(hallWithoutSeats);
            });
            cinemas.push(new Cinema(
                parseInt(cinema.cinemaId),
                cinema.title,
                cinema.address,
                hallsWithoutSeats
            ));
        });

        setCinemas();
    }
    else alert('Ошибка получения кинотеатров');
}

async function getShowtimes(){
    let url = `http://127.0.0.1:${port}/api/showtimes`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok){
        let body = await response.text();
        let json = JSON.parse(body);
        showtimes = [];
        json.forEach(showtime => {
            let hallsWithoutSeats = []
            showtime.cinema.halls.forEach(hall => {
                let hallWithoutSeats = new HallWithoutSeats(
                    parseInt(hall.hallId),
                    parseInt(hall.cinemaId),
                    parseInt(hall.number)
                );
                hallsWithoutSeats.push(hallWithoutSeats);
            });
            let cinema = new Cinema(
                parseInt(showtime.cinema.cinemaId),
                showtime.cinema.title,
                showtime.cinema.address,
                hallsWithoutSeats
            );
            showtimes.push(
                new Showtime(
                    parseInt(showtime.showtimeId),
                    cinema,
                    parseInt(showtime.hallId),
                    showtime.movieTitle,
                    showtime.time,
                    parseInt(showtime.basePrice)
                )
            );
        });

        setShowtimes();
    }
    else alert('Ошибка получения киносеансов');
}

function setShowtimes(){
    let container = document.querySelector('.showtimes');
    container.innerHTML = '';
    showtimes.forEach(showtime => {
        const[date, time] = showtime.time.split(' ');
        const [year, month, day] = date.split('-');
        let str = 
        `
        <div class="showtime">
            <div class="showtime__desc">
                <div class="showtime__title">${showtime.movieTitle}</div>
                <div class="showtime__cinema">${showtime.cinema.title}, ${showtime.cinema.address}</div>
                <div class="showtime__datetime">
                    <div class="showtime__date datetime">${day}.${month}.${year}</div>
                    <div class="showtime__time datetime">${time.substring(0, 5)}</div>
                </div>
                <div class="showtime__id" style="display: none;">${showtime.showtimeId}</div>
            </div>
            <div class="showtime__buttons">
                <div class="showtime__change_btn">Изменить</div>
                <div class="showtime__delete_btn">Удалить</div>
            </div>
        </div>
        `;

        container.insertAdjacentHTML('beforeend', str);
    });

    setButtons();
}

function setCinemas(){
    let select = document.getElementById('cinema_select');
    select.innerHTML = '';
    select.insertAdjacentHTML('beforeend', '<option disabled selected value="-1">Выберите кинотеатр</option>');

    cinemas.forEach(cinema =>{
        select.insertAdjacentHTML('beforeend', `<option value="${cinema.cinemaId}">${cinema.title} (${cinema.address})</option>`);
    });

    select.onchange = setHalls;

    getShowtimes();
}

function setHalls(e){
    hallSelect.innerHTML = '';
    cinemas.forEach(cinema => {
        if(cinema.cinemaId == parseInt(cinemaSelect.value)){
            cinema.halls.forEach(hall => {
                let str = `<option value="${hall.hallId}">${hall.number}</option>`;
                hallSelect.insertAdjacentHTML('beforeend', str);
            });
        }
    })
    hallSubtitle.style.display = 'block';
    hallSelect.style.display = 'block';
}

function setButtons(){
    document.querySelectorAll('.showtime__change_btn').forEach(button =>{
        button.onclick = setChangeButton;
    });
    document.querySelectorAll('.showtime__delete_btn').forEach(button =>{
        button.onclick = setDeleteButton;
    });
    formAdd.onclick = saveShowtime;
    formChange.onclick = updateShowtime;
}

function setChangeButton(e){
    let root = e.currentTarget.parentElement.parentElement;
    let id = parseInt(root.querySelector('.showtime__id').innerHTML);
    formId.innerHTML = id;
    for(let i = 0; i < showtimes.length; i++){
        if(showtimes[i].showtimeId == id){
            movieTitleInput.value = showtimes[i].movieTitle;
            cinemaSelect.value = showtimes[i].cinema.cinemaId;
            setHalls(null);
            for(let j = 0; j < showtimes[i].cinema.halls.length; j++){
                if(showtimes[i].cinema.halls[j].number == showtimes[i].hallNumber) hallSelect.value = showtimes[i].cinema.halls[j].hallId;
            }
            const[date, time] = showtimes[i].time.split(' ');
            dateInput.value = date;
            timeInput.value = time.substring(0, 5);
            priceInput.value = showtimes[i].basePrince;
            break;
        }
    }

    formAdd.style.display = 'none';
    formChange.style.display = 'block';
    overlay.style.display = 'block';
}

async function saveShowtime() {
    if(!isInt(priceInput.value)){
        alert('Базовая стоимость должна быть положительным числом');
        return;
    }
    let basePrice = parseInt(priceInput.value);
    if(basePrice <= 0){
        alert('Базовая стоимость должна быть положительным числом');
        return;
    }
    let data = {
        'movieTitle': movieTitleInput.value,
        'hallId': hallSelect.value,
        'time': `${dateInput.value} ${timeInput.value}:00`,
        'basePrice': basePrice,
    };
    console.log(data);
    let url = `http://localhost:${port}/api/showtimes`;
    let response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        overlay.style.display = 'none';
        getShowtimes();
    }
    else alert('Ошибка при добавлении сеанса');
}

async function updateShowtime() {
    if(!isInt(priceInput.value)){
        alert('Базовая стоимость должна быть положительным числом');
        return;
    }
    let basePrice = parseInt(priceInput.value);
    if(basePrice <= 0){
        alert('Базовая стоимость должна быть положительным числом');
        return;
    }
    let data = {
        'movieTitle': movieTitleInput.value,
        'hallId': hallSelect.value,
        'time': `${dateInput.value} ${timeInput.value}:00`,
        'basePrice': basePrice,
    };
    console.log(data);
    let url = `http://localhost:${port}/api/showtimes/${formId.innerHTML}`;
    let response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        overlay.style.display = 'none';
        getShowtimes();
    }
    else alert('Ошибка при изменении сеанса');
}

async function setDeleteButton(e){
    let id = e.currentTarget.parentElement.parentElement.querySelector('.showtime__id').innerHTML;
    let url = `http://localhost:${port}/api/showtimes/${id}`;
    let response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        getShowtimes();
    }
    else alert('Ошибка при удалении сеанса');
}

function isInt(str) {
    return !isNaN(str) && !isNaN(parseInt(str));
}

entrypoint();

