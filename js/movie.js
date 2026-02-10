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