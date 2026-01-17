'use strict'

class Showtime{
    constructor(showtimeId, movieTitle, cinema, hallNumber, date, time, price){
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.cinema = cinema;
        this.hallNumber = hallNumber;
        this.date = date;
        this.time = time;
        this.price = price;
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

class Hall{
    constructor(hallId, number, seats){
        this.hallId = hallId;
        this.number = number;
        this.seats = seats;
    }
}

let cinemas = [
    new Cinema(1, 'Киномакс', 'ул. Самарская дом 1', [new Hall(1, 1, []), new Hall(2, 2, []), new Hall(3, 3, []), new Hall(4, 4, [])]),
    new Cinema(2, 'Киномакс', 'ул. Самарская дом 1', [new Hall(5, 1, []), new Hall(6, 2, []), new Hall(7, 3, [])]),
    new Cinema(3, 'Киномакс', 'ул. Самарская дом 1', [new Hall(8, 1, []), new Hall(9, 2, [])]),
    new Cinema(4, 'Киномакс', 'ул. Самарская дом 1', [new Hall(10, 1, [])])
]

let showtimes = [
    new Showtime(1, "Дюна: Часть вторая", cinemas[0], 1, "2026-01-16", "20:00", 650),
    new Showtime(2, "Дюна: Часть вторая", cinemas[1], 2, "2026-01-16", "20:00", 550)
];

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

function setShowtimes(){
    let container = document.querySelector('.showtimes');
    container.innerHTML = '';
    showtimes.forEach(showtime => {
        const [year, month, day] = showtime.date.split('-');
        let str = 
        `
        <div class="showtime">
            <div class="showtime__desc">
                <div class="showtime__title">${showtime.movieTitle}</div>
                <div class="showtime__cinema">${showtime.cinema.title}, ${showtime.cinema.address}</div>
                <div class="showtime__datetime">
                    <div class="showtime__date datetime">${day}.${month}.${year}</div>
                    <div class="showtime__time datetime">${showtime.time}</div>
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
    
    setCinemas();
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
    let buttons = document.querySelectorAll('.showtime__change_btn');

    buttons.forEach(button =>{
        button.onclick = setChangeButton;
    });
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
            dateInput.value = showtimes[i].date;
            timeInput.value = showtimes[i].time;
            priceInput.value = showtimes[i].price;
            break;
        }
    }

    formAdd.style.display = 'none';
    formChange.style.display = 'block';
    overlay.style.display = 'block';
}

setShowtimes();

