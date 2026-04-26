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

let port = 8000;

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
    checkAuth();
    movies = [];
    let url = `http://127.0.0.1:${port}/api/movies`;
    let response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
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
    else showModalResult('Ошибка получения фильмов', false);
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
        showModalResult('Продолжительность должна быть положительным числом', false);
        return;
    }
    let durationInt = parseInt(movieDuration.value);
    if(durationInt <= 0){
        showModalResult('Продолжительность должна быть положительным числом', false);
        return;
    }
    let url = `http://localhost:${port}/api/movies`;
    let response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        showModalResult('Успешно', true);
        overlay.style.display = 'none';
        getMovies();
    }
    else showModalResult('Ошибка при добавлении фильма', false);
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
        showModalResult('Продолжительность должна быть положительным числом', false);
        return;
    }
    let durationInt = parseInt(movieDuration.value);
    if(durationInt <= 0){
        showModalResult('Продолжительность должна быть положительным числом', false);
        return;
    }
    let url = `http://localhost:${port}/api/movies/${formId.innerHTML}`;
    let response = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        showModalResult('Успешно', true);
        overlay.style.display = 'none';
        getMovies();
    }
    else showModalResult('Ошибка при изменении фильма', false);
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
    let response = await fetchWithAuth(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        showModalResult('Успешно', true);
        getMovies();
    }
    else showModalResult('Ошибка при удалении фильма', false);
}

async function checkAuth() {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!accessToken) {
    window.location.href = 'admin_sign_in.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:${port}/test/admin`, {
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
        window.location.href = 'admin_sign_in.html';
        return;
      }

      const data = await refreshResponse.json();

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const response = await fetch(`http://localhost:${port}/test/admin`, {
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
    showModalResult("Ошибка аутентификации " + e, false);
  }

    window.location.href = 'admin_sign_in.html';
    return;
}

async function fetchWithAuth(url, options = {}) {
    // Функция для выполнения запроса с текущим access token
    async function executeRequest(token) {
        return fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json;charset=utf-8'
        }
        });
    }

    // Получаем текущий access token
    let accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
        window.location.href = 'admin_sign_in.html';
        return;
    }

    // Выполняем первый запрос
    let response = await executeRequest(accessToken);

    // Если запрос успешен, возвращаем ответ
    if (response.status !== 401) {
        return response;
    }

    // Если получили 401, пробуем обновить токен
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
        logout();
        window.location.href = 'admin_sign_in.html';
        return;
    }

    // Обновляем токены
    const refreshResponse = await fetch(`http://localhost:${port}/refresh`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ token: refreshToken })
    });

    if (!refreshResponse.ok) {
        logout();
        window.location.href = 'admin_sign_in.html';
        return;
    }

    const data = await refreshResponse.json();

    // Сохраняем новые токены
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    // Повторяем исходный запрос с новым токеном
    return await executeRequest(data.access_token);

}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

getMovies();

function isInt(str) {
    return !isNaN(str) && !isNaN(parseInt(str));
}

// Модальное окно для сообщений (универсальное)
function showModalResult(message, isSuccess = null, onClose = null) {
    const modal = document.getElementById('modal_result');
    const msg = document.getElementById('modal_message');
    const icon = document.getElementById('modal_icon');
    const close = document.getElementById('modal_close');
    msg.textContent = message;
    if (isSuccess === true) {
        icon.innerHTML = '✔️';
        icon.className = 'modal__icon success';
    } else if (isSuccess === false) {
        icon.innerHTML = '❌';
        icon.className = 'modal__icon error';
    } else {
        icon.innerHTML = '';
        icon.className = 'modal__icon';
    }
    modal.style.display = 'flex';
    close.onclick = function() {
        modal.style.display = 'none';
        if (onClose) onClose();
    };
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (onClose) onClose();
        }
    };
}
