'use strict'

class Showtime{
    constructor(movie, time){
        this.movie = movie; // объект Movie
        this.time = time; // список времён сеансов
    }
}

class Movie{
    constructor(movieId, title, genres, duration, poster, description){
        this.movieId = movieId;
        this.title = title;
        this.genres = genres; // список строк
        this.duration = duration;
        this.poster = poster;
        this.description = description;
    }
}

let port = 44249;

let showtimesByMovie = new Map();
let uniqueGenres = new Set();
let uniqueTimes = new Set();

async function getShowtimes(){
    let url = `http://127.0.0.1:${port}/api/showtimes/movies`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include'
    });
    if(response.ok){
        let body = await response.text();
        let json = JSON.parse(body);
        showtimesByMovie.clear();
        json.forEach(item => {
            const movie = new Movie(
            parseInt(item.movie.movieId),
            item.movie.title,
            item.movie.genres,
            item.movie.duration,
            item.movie.poster,
            item.movie.description
            );

            item.movie.genres.forEach(genre => uniqueGenres.add(genre));
            uniqueTimes.add(item.time.split(' ')[0]);

            if (showtimesByMovie.has(movie.movieId)) {
                const existingShowtime = showtimesByMovie.get(movie.movieId);
                if (!existingShowtime.time.includes(item.time.split(' ')[0])) {
                    existingShowtime.time.push(item.time.split(' ')[0]);
                }
            } else {
                const showtime = new Showtime(
                    movie,
                    [item.time.split(' ')[0]]
                );
                showtimesByMovie.set(movie.movieId, showtime);
            }
        });

        setShowtimes();
        setGenres();

        const pickr = window.flatpickr('#date__value', {
        'locale': 'ru',
        enable: [...uniqueTimes],
        dateFormat: 'd.m.Y'
    });

    document.querySelector('#date__value').onchange = setShowtimes;
    document.querySelector('.date__reset').onclick = pickr.clear;
    }
    else alert('Ошибка получения киносеансов');
}

function setShowtimes(){
    let container = document.querySelector('.movies__container');
    container.innerHTML = '';
    let date = document.querySelector('#date__value').value;
    if(date != ''){
        const [day, month, year] = date.split('.');
        date = `${year}-${month}-${day}`;
    }
    let genre = document.querySelector('.active_genre').innerHTML;
    let count = 0;
    for(const [key, value] of showtimesByMovie){
        if(genre != 'Все жанры' && !value.movie.genres.includes(genre))continue;
        if(date != '' && !value.time.includes(date))continue;

        let str = 
        `
        <div class="movie">
            <img class="movie__img" src="${value.movie.poster}">
            <div class="movie__body">
                <div class="movie_desc">
                    <div class="movie__title">${value.movie.title}</div>
                    <div class="movie__genre">${value.movie.genres.join(', ')}</div>
                    <div class="movie__duration"><img src="img/clock.png" alt=""><div class="duration__text">${value.movie.duration} мин</div></div>
                </div>
                <a class="movie__btn" href="movie.html?movieId=${value.movie.movieId}">Подробнее</a>
            </div>
        </div>
        `;

        container.insertAdjacentHTML('beforeend', str);
        count++;
    }

    document.querySelector('.movies__title').innerHTML = `Сейчас в кино (${count})`;
}

function setGenres(){
    let container = document.querySelector('.genres__container');
    container.innerHTML = '';

    let str = '<div class="genre active_genre">Все жанры</div>';
    container.insertAdjacentHTML('beforeend', str);

    for(const genre of uniqueGenres){
        str = `<div class="genre">${genre}</div>`;
        container.insertAdjacentHTML('beforeend', str);
    }

    let genresObjects = document.querySelectorAll('.genre');
    genresObjects.forEach(genre =>{
        genre.onclick = function(e){
            document.querySelector('.active_genre').classList.toggle("active_genre");
            e.currentTarget.classList.toggle("active_genre");
            setShowtimes();
        }
    });
}

getShowtimes();