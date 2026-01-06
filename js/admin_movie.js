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

let movies = [
    new Movie(
        1, "Дюна: Часть вторая", ["Научная фантастика", "Боевик"], 168, ["2026-01-10"], "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"
    ),
    new Movie(
        2, "Дюна: Часть вторая", ["Научная фантастика", "Боевик"], 168, ["2026-01-11"], "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"
    ),
    new Movie(
        3, "Дюна: Часть вторая", ["Научная фантастика", "Боевик"], 168, ["2026-01-11"], "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80"
    )
];

let add = document.querySelector('.main__btn');
let overlay = document.querySelector('.overlay');
let exit = document.querySelector('.form__exit');
let formAdd = document.getElementById('form__add_btn');
let formChange = document.getElementById('form__change_btn');
let formId = document.getElementById('form__movie_id');

add.onclick = function(e){
    formId.innerHTML = '';
    formAdd.style.display = 'block';
    formChange.style.display = 'none';
    overlay.style.display = 'block';
}

exit.onclick = function(e){
    overlay.style.display = 'none';
}

function setMovies(){
    let container = document.querySelector('.movies');
    movies.forEach(movie =>{
        let str = 
        `
        <div class="movie">
            <div class="movie__desc">
                <div class="movie__title">${movie.title}</div>
                <div class="movie__genres">
        `;
        movie.genres.forEach(genre => {str += `<div class="movie__genre">${genre}</div>`});
        str +=
        `
                </div>
                <div class="movie__duration">${movie.duration} мин</div>
                <div class="movie__id" style="display: none;">${movie.movieId}</div>
            </div>
            <div class="movie__buttons">
                <div class="movie__change_btn">Изменить</div>
                <div class="movie__delete_btn">Удалить</div>
            </div>
        </div>
        `;

        container.insertAdjacentHTML('beforeend', str);
    });
    setButtons();
}

function setButtons(){
    let buttons = document.querySelectorAll('.movie__change_btn');
    buttons.forEach(button =>{
        button.onclick = setChangeButton;
    });
}

function setChangeButton(e){
    formId.innerHTML = e.currentTarget.parentElement.parentElement.querySelector('.movie__id').innerHTML;
    formAdd.style.display = 'none';
    formChange.style.display = 'block';
    overlay.style.display = 'block';
}

setMovies();
