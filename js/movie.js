'use strict'

let port = 8000;

async function setData(){
    let url = `http://127.0.0.1:${port}/api/movies/${getUrlParameter('movieId')}`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok){
        let body = await response.text();
        let data = JSON.parse(body);

        let poster = `<img src="${data.poster}" alt="Постер" class="poster__image">`;
        document.querySelector('.content__poster').innerHTML = '';
        document.querySelector('.content__poster').insertAdjacentHTML('beforeend', poster);
        document.querySelector('.description__title').innerHTML = data.title;
        let genres = document.querySelector('.description__genres');
        data.genres.forEach(element => {
            let str = `<div class="description__genre">${element}</div>`;
            genres.insertAdjacentHTML('beforeend', str);
        });
        document.querySelector('.duration__text').innerHTML = `${data.duration} мин`;
        document.querySelector('.description__text').innerHTML = data.description;
    }
    else alert('Ошибка получения фильма');
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

setData();

document.querySelector('.sign_in_btn').onclick = function(e){
    window.location.href = 'sign_in.html';
}

document.querySelector('.sign_up_btn').onclick = function(e){
    window.location.href = 'sign_up.html';
}

document.querySelector('.description__btn').onclick = function(e){
    window.location.href = `choice_of_cinema.html?movieId=${getUrlParameter('movieId')}`;
}

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
        method: "POST",
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: {
            token: JSON.stringify(refreshToken)
        }
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