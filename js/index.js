'use strict'

class Movie{
    constructor(movieId, title, genres, duration, dates, img){
        this.movieId = movieId;
        this.title = title;
        this.genres = genres;
        this.duration = duration;
        this.dates = dates;
        this.img = img;
    }
}

let genres = ["Анимация", "Биография", "Боевик", "Драма", "Комедия", "Научная фантастика"];

let movies = [
    new Movie(
        1, "Дюна: Часть вторая", ["Научная фантастика"], 168, ["2026-01-10"], "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"
    ),
    new Movie(
        2, "Дюна: Часть вторая", ["Боевик"], 168, ["2026-01-11"], "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"
    )
];

let dates = ["2026-01-10", "2026-01-11"];

function getMovies(){
    const pickr = window.flatpickr('#date__value', {
        'locale': 'ru',
        enable: dates,
        dateFormat: 'd.m.Y'
    });

    document.querySelector('#date__value').onchange = setMovies;
    document.querySelector('.date__reset').onclick = pickr.clear;
}

function setMovies(){
    let container = document.querySelector('.movies__container');
    container.innerHTML = '';
    let date = document.querySelector('#date__value').value;
    if(date != ''){
        const [day, month, year] = date.split('.');
        date = `${year}-${month}-${day}`;
    }
    let genre = document.querySelector('.active_genre').innerHTML;
    let count = 0;
    for(let key in movies){
        if(genre != 'Все жанры' && !movies[key].genres.includes(genre))continue;
        if(date != '' && !movies[key].dates.includes(date))continue;

        let str = 
        `
        <div class="movie">
            <img class="movie__img" src="${movies[key].img}">
            <div class="movie__body">
                <div class="movie_desc">
                    <div class="movie__title">${movies[key].title}</div>
                    <div class="movie__genre">${movies[key].genres.join(', ')}</div>
                    <div class="movie__duration"><img src="img/clock.png" alt=""><div class="duration__text">${movies[key].duration} мин</div></div>
                </div>
                <div class="movie__btn">Подробнее</div>
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

    for(let genre in genres){
        str = `<div class="genre">${genres[genre]}</div>`;
        container.insertAdjacentHTML('beforeend', str);
    }

    let genresObjects = document.querySelectorAll('.genre');
    genresObjects.forEach(genre =>{
        genre.onclick = function(e){
            document.querySelector('.active_genre').classList.toggle("active_genre");
            e.currentTarget.classList.toggle("active_genre");
            setMovies();
        }
    });
}

getMovies();
setGenres();
setMovies();