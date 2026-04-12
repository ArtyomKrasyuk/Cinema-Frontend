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

let port = 8000;

let showtimesByMovie = new Map();
let uniqueGenres = new Set();
let uniqueTimes = new Set();
let currentPage = 1;
let totalPages = 1;
const MOVIES_PER_PAGE = 12;

document.querySelector('.sign_in_btn').onclick = function(e){
    window.location.href = 'sign_in.html';
}

document.querySelector('.sign_up_btn').onclick = function(e){
    window.location.href = 'sign_up.html';
}

async function getShowtimes(){
    let url = `http://127.0.0.1:${port}/api/showtimes/movies`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
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

    document.querySelector('#date__value').onchange = function() {
        currentPage = 1;
        setShowtimes();
    };
    document.querySelector('.date__reset').onclick = pickr.clear;
    }
    else alert('Ошибка получения киносеансов');
}

function renderPagination(total, current) {
    const container = document.querySelector('.movies__container');
    let pagination = document.querySelector('.pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.className = 'pagination';
        container.parentNode.appendChild(pagination);
    }
    pagination.innerHTML = '';
    if (total <= 1) {
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex';
    // Prev
    const prev = document.createElement('span');
    prev.textContent = '<';
    prev.className = 'pagination__arrow';
    prev.onclick = () => { if (current > 1) { currentPage--; setShowtimes(); } };
    pagination.appendChild(prev);
    // Pages
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - current) <= 1) {
            const page = document.createElement('span');
            page.textContent = i;
            page.className = 'pagination__page' + (i === current ? ' active' : '');
            page.onclick = () => { currentPage = i; setShowtimes(); };
            pagination.appendChild(page);
        } else if (
            (i === 2 && current > 3) ||
            (i === total - 1 && current < total - 2)
        ) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'pagination__dots';
            pagination.appendChild(dots);
        }
    }
    // Next
    const next = document.createElement('span');
    next.textContent = '>';
    next.className = 'pagination__arrow';
    next.onclick = () => { if (current < total) { currentPage++; setShowtimes(); } };
    pagination.appendChild(next);
}

function setShowtimes(){
    let container = document.querySelector('.movies__container');
    container.innerHTML = '';
    let date = document.querySelector('#date__value').value;
    if(date != ''){
        const [day, month, year] = date.split('.');
        date = `${year}-${month}-${day}`;
        localStorage.setItem('selected_time', date);
    }
    let genre = document.querySelector('.active_genre').innerHTML;
    let filtered = [];
    for(const [key, value] of showtimesByMovie){
        if(genre != 'Все жанры' && !value.movie.genres.includes(genre))continue;
        if(date != '' && !value.time.includes(date))continue;
        filtered.push(value);
    }
    let count = filtered.length;
    totalPages = Math.ceil(count / MOVIES_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    const end = start + MOVIES_PER_PAGE;
    filtered.slice(start, end).forEach(value => {
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
    });
    document.querySelector('.movies__title').innerHTML = `Сейчас в кино (${count})`;
    renderPagination(totalPages, currentPage);
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
            currentPage = 1;
            setShowtimes();
        }
    });
}

getShowtimes();

document.querySelector('.profile').onclick = function(e){
    window.location.href = 'profile.html';
}

async function checkAuth() {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(`http://localhost:${port}/test/client`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });

    if (response.status === 200) {
      return true;
    }

    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch(`http://localhost:${port}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ token: refreshToken })
        });

      if (!refreshResponse.ok) {
        logout();
        return false;
      }

      const data = await refreshResponse.json();

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const response = await fetch(`http://localhost:${port}/test/client`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
      });

      if (response.status === 200) {
        return true;
      }
    }

  } catch (e) {
    console.error("Ошибка аутентификации", e);
  }

  return false;
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function setHeader() {
    if(await checkAuth()){
        document.querySelector('.header__buttons').style.display = 'none';
        document.querySelector('.profile').style.display = 'block';
    } 
}

setHeader();