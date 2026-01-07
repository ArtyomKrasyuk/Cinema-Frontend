'use strict'

class Hall{
    constructor(hallId, number, seats){
        this.hallId = hallId;
        this.number = number;
        this.seats = seats;
    }
}

class Cinema{
    constructor(cinemaId, title, address, halls){
        this.cinemaId = cinemaId;
        this.title = title;
        this.address = address;
        this.halls = halls;
    }
}

let cinemas = [
    new Cinema(1, 'Киномакс', 'ул. Самарская дом 1', [new Hall(1, 1, []), new Hall(2, 2, []), new Hall(3, 3, []), new Hall(4, 4, [])]),
    new Cinema(2, 'Киномакс', 'ул. Самарская дом 1', [new Hall(5, 1, []), new Hall(6, 2, []), new Hall(7, 3, [])]),
    new Cinema(3, 'Киномакс', 'ул. Самарская дом 1', [new Hall(8, 1, []), new Hall(9, 2, [])]),
    new Cinema(4, 'Киномакс', 'ул. Самарская дом 1', [new Hall(10, 1, [])])
]

let addCinema = document.getElementById('cinema_add');
let overlay = document.querySelector('.overlay');
let exit = document.querySelector('.cinema_form__exit');
let formAdd = document.getElementById('cinema_form__add_btn');
let formChange = document.getElementById('cinema_form__change_btn');
let formId = document.getElementById('cinema_form__cinema_id');
let formCinemaTitle = document.getElementById('cinema_form_title');
let formCinemaAddress = document.getElementById('cinema_form_address');

addCinema.onclick = function(e){
    formId.innerHTML = '';
    formCinemaTitle.value = '';
    formCinemaAddress.value = '';
    formAdd.style.display = 'block';
    formChange.style.display = 'none';
    overlay.style.display = 'block';
}

exit.onclick = function(e){
    overlay.style.display = 'none';
}

function setCinemas(){
    let container = document.querySelector('.cinema__container');
    let select = document.getElementById('cinema_select');
    select.insertAdjacentHTML('beforeend', '<option disabled selected value="-1">Выберите кинотеатр</option>');

    cinemas.forEach(cinema =>{
        let str = 
        `
        <div class="cinema">
            <div class="cinema__desc">
                <div class="cinema__id" style="display: none;">${cinema.cinemaId}</div>
                <div class="cinema__title">${cinema.title}</div>
                <div class="cinema__address">${cinema.address}</div>
            </div>
            <div class="cinema__buttons">
                <div class="cinema__change_btn">Изменить</div>
                <div class="cinema__delete_btn">Удалить</div>
            </div>
        </div>
        `;

        container.insertAdjacentHTML('beforeend', str);
        select.insertAdjacentHTML('beforeend', `<option value="${cinema.cinemaId}">${cinema.title} (${cinema.address})</option>`);
    });
    setButtons();
    select.onchange = setHalls;
}

function setButtons(){
    let buttons = document.querySelectorAll('.cinema__change_btn');
    buttons.forEach(button =>{
        button.onclick = setChangeButton;
    });
}

function setChangeButton(e){
    formId.innerHTML = e.currentTarget.parentElement.parentElement.querySelector('.cinema__id').innerHTML;
    formCinemaTitle.value = e.currentTarget.parentElement.parentElement.querySelector('.cinema__title').innerHTML;
    formCinemaAddress.value = e.currentTarget.parentElement.parentElement.querySelector('.cinema__address').innerHTML;
    formAdd.style.display = 'none';
    formChange.style.display = 'block';
    overlay.style.display = 'block';
}

function setHalls(e){
    let select = document.getElementById('cinema_select');
    let createBtn = document.getElementById('create');
    if(createBtn.classList.contains('nav__option_active')) return;
    let container = document.getElementById('hall_select');
    container.innerHTML = '';
    cinemas.forEach(cinema => {
        if(cinema.cinemaId == parseInt(select.value)){
            cinema.halls.forEach(hall => {
                let str = `<option value="${hall.hallId}">${hall.number}</option>`;
                container.insertAdjacentHTML('beforeend', str);
            });
        }
    })
    document.getElementById('hall_subtitle').style.display = 'block';
    container.style.display = 'block';
}

function setNav(){
    let createBtn = document.getElementById('create');
    let changeBtn = document.getElementById('change');
    let deleteBtn = document.getElementById('delete');
    let select = document.getElementById('cinema_select');

    createBtn.onclick = function(e){
        document.querySelector('.nav__option_active').classList.toggle('nav__option_active');
        createBtn.classList.toggle('nav__option_active');

        document.getElementById('hall_select').style.display = 'none';
        document.getElementById('hall_input').style.display = 'block';

        document.getElementById('hall_add').style.display = 'block';
        document.getElementById('hall_change').style.display = 'none';
        document.getElementById('hall_delete').style.display = 'none';
    }

    changeBtn.onclick = function(e){
        document.querySelector('.nav__option_active').classList.toggle('nav__option_active');
        changeBtn.classList.toggle('nav__option_active');

        document.getElementById('hall_select').style.display = 'none';
        document.getElementById('hall_input').style.display = 'none';
        document.getElementById('hall_subtitle').style.display = 'none';

        document.getElementById('hall_add').style.display = 'none';
        document.getElementById('hall_change').style.display = 'block';
        document.getElementById('hall_delete').style.display = 'none';
        
        if(parseInt(select.value) != -1) setHalls();
    }

    deleteBtn.onclick = function(e){
        document.querySelector('.nav__option_active').classList.toggle('nav__option_active');
        deleteBtn.classList.toggle('nav__option_active');

        document.getElementById('hall_select').style.display = 'none';
        document.getElementById('hall_input').style.display = 'none';
        document.getElementById('hall_subtitle').style.display = 'none';

        document.getElementById('hall_add').style.display = 'none';
        document.getElementById('hall_change').style.display = 'none';
        document.getElementById('hall_delete').style.display = 'block';

         if(parseInt(select.value) != -1) setHalls();
    }
}

setCinemas();
setNav();
