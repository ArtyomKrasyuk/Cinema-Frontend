'use strict'

class Movie{
    constructor(movieId, title, genres, duration, poster, description){
        this.movieId = movieId;
        this.title = title;
        this.genres = genres;
        this.duration = duration;
        this.poster = poster;
        this.description = description;
    }
}

let movies = [];

let port = 44249;

let add = document.querySelector('.main__btn');
let overlay = document.querySelector('.overlay');
let exit = document.querySelector('.form__exit');
let formAdd = document.getElementById('form__add_btn');
let formChange = document.getElementById('form__change_btn');
let formId = document.getElementById('form__movie_id');
let movieTitle = document.getElementById('movie_title');
let movieGenres = document.getElementById('movie_genres');
let movieDuration = document.getElementById('movie_duration');
let movieURL = document.getElementById('movie_url');
let movieDesc = document.getElementById('movie_desc');

add.onclick = function(e){
    formId.innerHTML = '';
    movieTitle.value = '';
    movieGenres.value = '';
    movieDuration.value = '';
    movieURL.value = '';
    movieDesc.value = '';
    formAdd.style.display = 'block';
    formChange.style.display = 'none';
    overlay.style.display = 'block';
}

exit.onclick = function(e){
    overlay.style.display = 'none';
}

async function getMovies(){
    movies = [];
    let url = `http://127.0.0.1:${port}/api/movies`;
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
        movies = [];
        json.forEach(movie => {
            movies.push(new Movie(
                parseInt(movie.movieId),
                movie.title,
                movie.genres,
                parseInt(movie.duration),
                movie.poster,
                movie.description
            ));
        });

        setMovies();
    }
    else alert('Ошибка получения фильмов');
}

function setMovies(){
    let container = document.querySelector('.movies');
    container.innerHTML = '';
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

async function saveMovie() {
    let data = {
        'title': movieTitle.value,
        'genres': movieGenres.value.split('; '),
        'duration': movieDuration.value,
        'poster': movieURL.value,
        'description': movieDesc.value
    };
    if(!isInt(movieDuration.value)){
        alert('Продолжительность должна быть положительным числом');
        return;
    }
    let durationInt = parseInt(movieDuration.value);
    if(durationInt <= 0){
        alert('Продолжительность должна быть положительным числом');
        return;
    }
    let url = `http://localhost:${port}/api/movies`;
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
        getMovies();
    }
    else alert('Ошибка при добавлении фильма');
}

async function updateMovie() {
    let data = {
        'title': movieTitle.value,
        'genres': movieGenres.value.split('; '),
        'duration': movieDuration.value,
        'poster': movieURL.value,
        'description': movieDesc.value
    };
    if(!isInt(movieDuration.value)){
        alert('Продолжительность должна быть положительным числом');
        return;
    }
    let durationInt = parseInt(movieDuration.value);
    if(durationInt <= 0){
        alert('Продолжительность должна быть положительным числом');
        return;
    }
    let url = `http://localhost:${port}/api/movies/${formId.innerHTML}`;
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
        getMovies();
    }
    else alert('Ошибка при изменении фильма');
}

function setButtons(){
    document.querySelectorAll('.movie__change_btn').forEach(button =>{
        button.onclick = setChangeButton;
    });
    document.querySelectorAll('.movie__delete_btn').forEach(button =>{
        button.onclick = setDeleteButton;
    });
    formAdd.onclick = saveMovie;
    formChange.onclick = updateMovie;
}

function setChangeButton(e){
    let id = parseInt(e.currentTarget.parentElement.parentElement.querySelector('.movie__id').innerHTML);
    formId.innerHTML = id;
    movies.forEach(movie =>{
        if(movie.movieId == id){
            movieTitle.value = movie.title;
            movieGenres.value = movie.genres.join('; ');
            movieDuration.value = movie.duration;
            movieURL.value = movie.poster;
            movieDesc.value = movie.description;
        }
    });
    formAdd.style.display = 'none';
    formChange.style.display = 'block';
    overlay.style.display = 'block';
}

async function setDeleteButton(e){
    let id = e.currentTarget.parentElement.parentElement.querySelector('.movie__id').innerHTML;
    let url = `http://localhost:${port}/api/movies/${id}`;
    let response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        getMovies();
    }
    else alert('Ошибка при удалении фильма');
}

getMovies();

function isInt(str) {
    return !isNaN(str) && !isNaN(parseInt(str));
}
