'use strict'

function toggle(){
    document.querySelector('.profile_card__information').classList.toggle('hidden');
    document.querySelector('.profile_card__changes').classList.toggle('hidden');
}

document.querySelector('.profile_card__btn').onclick = toggle;
document.querySelector('.changes__cancel').onclick = toggle;

document.addEventListener('DOMContentLoaded', () => {
    const moviesContainer = document.querySelector('.movie_section__movies');
    const paginationContainer = document.querySelector('.movie_section__pages');

    // Пример данных фильмов
    const favoriteMovies = [
        { title: 'Матрица', genres: ['Фантастика', 'Боевик'], year: 1999, country: 'США', rating: 8.7, img: 'img/Matrix-DVD.jpg', link: 'no_page.html' },
        { title: 'Интерстеллар', genres: ['Фантастика', 'Драма'], year: 2014, country: 'США', rating: 8.6, img: 'img/Interstellar_2014.jpg', link: 'no_page.html' },
        { title: 'Форрест Гамп', genres: ['Драма', 'Комедия'], year: 1994, country: 'США', rating: 9.5, img: 'img/forest.webp', link: 'no_page.html' },
        { title: 'Начало', genres: ['Фантастика', 'Триллер'], year: 2010, country: 'США', rating: 8.9, img: 'img/nachalo.webp', link: 'no_page.html' },
        { title: 'Таксист', genres: ['Драма', 'Криминал'], year: 1976, country: 'США', rating: 8.4, img: 'img/taxi_driver.jpg', link: 'no_page.html' },
        { title: 'Брат', genres: ['Драма', 'Криминал'], year: 1997, country: 'Россия', rating: 8.3, img: 'img/brother.webp', link: 'no_page.html' },
        { title: 'Брат 2', genres: ['Драма', 'Криминал'], year: 2000, country: 'Россия', rating: 8.2, img: 'img/Brat2.jpg', link: 'no_page.html' },
    ];

    const MOVIES_PER_PAGE = 4;
    let currentPage = 1;

    // Рендер фильмов
    function renderMovies(moviesList) {
        const start = (currentPage - 1) * MOVIES_PER_PAGE;
        const end = start + MOVIES_PER_PAGE;
        const visibleMovies = moviesList.slice(start, end);

        moviesContainer.innerHTML = ''; 

        visibleMovies.forEach(movie => {
            const div = document.createElement('div');
            div.classList.add('movie_section__movie');
            div.innerHTML = `
                <img src="${movie.img}" alt="Постер" class="movie__img"/>
                <div class="movie__description">
                    <h2 class="movie__title"><a href="${movie.link}">${movie.title}</a></h2>
                    <p class="movie__genres">${movie.genres}</p>
                    <div class="movie__rating">
                        <img src="img/star.png" alt="Рейтинг" class="rating__img" />
                        <p class="rating__number">${movie.rating}</p>
                    </div>
                    <button class="movie__btn">Убрать из избранного</button>
                </div>
            `;
            moviesContainer.appendChild(div);
        });
    }

    // Пагинация
    function renderPagination(totalItems) {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalItems / MOVIES_PER_PAGE);
        if (totalPages <= 1) return;

        const prev = document.createElement('span');
        prev.textContent = '<';
        prev.classList.add('pages__page');
        if (currentPage === 1) prev.classList.add('disabled');
        prev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateMovies();
            }
        });
        paginationContainer.appendChild(prev);

        const maxVisible = 2;
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - maxVisible && i <= currentPage + maxVisible)
            ) {
                const page = document.createElement('span');
                page.textContent = i;
                page.classList.add('pages__page');
                if (i === currentPage) page.classList.add('active');
                page.addEventListener('click', () => {
                    currentPage = i;
                    updateMovies();
                });
                paginationContainer.appendChild(page);
            } else if (
                i === currentPage - maxVisible - 1 ||
                i === currentPage + maxVisible + 1
            ) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('ellipsis');
                paginationContainer.appendChild(ellipsis);
            }
        }

        const next = document.createElement('span');
        next.textContent = '>';
        next.classList.add('pages__page');
        if (currentPage === totalPages) next.classList.add('disabled');
        next.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateMovies();
            }
        });
        paginationContainer.appendChild(next);
    }

    function updateMovies() {
        renderMovies(favoriteMovies);
        renderPagination(favoriteMovies.length);
    }

    updateMovies();
});
