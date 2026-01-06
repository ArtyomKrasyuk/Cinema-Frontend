'use strict'

let data = {
    'title': 'Дюна: Часть вторая',
    'genres': ['Научная фантастика', 'Боевик'],
    'duration': 166,
    'description': 'Пол Атрейдес объединяется с Чани и фрименами, борясь за месть заговорщикам, уничтожившим его семью. ' + 
    'Стоя перед выбором между любовью всей своей жизни и судьбой известной вселенной, ' +
    'он стремится предотвратить ужасное будущее, которое может предвидеть только он.'
};

function setData(){
    document.querySelector('.description__title').innerHTML = data.title;
    let genres = document.querySelector('.description__genres');
    data.genres.forEach(element => {
        let str = `<div class="description__genre">${element}</div>`;
        genres.insertAdjacentHTML('beforeend', str);
    });
    document.querySelector('.duration__text').innerHTML = `${data.duration} мин`;
    document.querySelector('.description__text').innerHTML = data.description;
}

setData();