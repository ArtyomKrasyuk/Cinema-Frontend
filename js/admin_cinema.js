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

class HallWithoutSeats{
    constructor(hallId, cinemaId, number){
        this.hallId = hallId;
        this.cinemaId = cinemaId;
        this.number = number;
    }
}

class HallRequest{
    constructor(cinemaId, number, seats){
        this.cinemaId = cinemaId;
        this.number = number;
        this.seats = seats;
    }
}

class SeatRequest{
    constructor(row, number, type){
        this.row = row,
        this.number = number,
        this.type = type
    }
}

let cinemas = []

let port = 44249;

let addCinema = document.getElementById('cinema_add');
let overlay = document.querySelector('.overlay');
let exit = document.querySelector('.cinema_form__exit');
let formAdd = document.getElementById('cinema_form__add_btn');
let formChange = document.getElementById('cinema_form__change_btn');
let formId = document.getElementById('cinema_form__cinema_id');
let formCinemaTitle = document.getElementById('cinema_form_title');
let formCinemaAddress = document.getElementById('cinema_form_address');

let optionSwitch = 'green';

let newHall = null;

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

document.getElementById('hall_btn').onclick = saveHall;
document.getElementById('hall_change_btn').onclick = updateHall;
document.getElementById('hall_delete_btn').onclick = deleteHall;

async function getCinemas(){
    let url = `http://127.0.0.1:${port}/api/cinemas`;
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
        cinemas = [];
        json.forEach(cinema => {
            let hallsWithoutSeats = []
            cinema.halls.forEach(hall => {
                let hallWithoutSeats = new HallWithoutSeats(
                    parseInt(hall.hallId),
                    parseInt(hall.cinemaId),
                    parseInt(hall.number)
                );
                hallsWithoutSeats.push(hallWithoutSeats);
            });
            cinemas.push(new Cinema(
                parseInt(cinema.cinemaId),
                cinema.title,
                cinema.address,
                hallsWithoutSeats
            ));
        });

        setCinemas();
    }
    else alert('Ошибка получения кинотеатров');
}

async function saveCinema() {
    let data = {'title': formCinemaTitle.value, 'address': formCinemaAddress.value};
    let url = `http://localhost:${port}/api/cinemas`;
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
        getCinemas();
    }
    else alert('Ошибка при добавлении кинотеатра');
}

async function changeCinema() {
    let data = {'title': formCinemaTitle.value, 'address': formCinemaAddress.value};
    let url = `http://localhost:${port}/api/cinemas/${formId.innerHTML}`;
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
        getCinemas();
    }
    else alert('Ошибка при редактировании кинотеатра');
}

function setCinemas(){
    let container = document.querySelector('.cinema__container');
    container.innerHTML = '';
    let select = document.getElementById('cinema_select');
    select.innerHTML = '';
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
    document.querySelectorAll('.cinema__change_btn').forEach(button =>{
        button.onclick = setChangeButton;
    });
    document.querySelectorAll('.cinema__delete_btn').forEach(button =>{
        button.onclick = deleteCinema;
    });
    formAdd.onclick = saveCinema;
    formChange.onclick = changeCinema;
}

function setChangeButton(e){
    formId.innerHTML = e.currentTarget.parentElement.parentElement.querySelector('.cinema__id').innerHTML;
    formCinemaTitle.value = e.currentTarget.parentElement.parentElement.querySelector('.cinema__title').innerHTML;
    formCinemaAddress.value = e.currentTarget.parentElement.parentElement.querySelector('.cinema__address').innerHTML;
    formAdd.style.display = 'none';
    formChange.style.display = 'block';
    overlay.style.display = 'block';
}

async function deleteCinema(e){
    let id = e.currentTarget.parentElement.parentElement.querySelector('.cinema__id').innerHTML;
    let url = `http://localhost:${port}/api/cinemas/${id}`;
    let response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        getCinemas();
    }
    else alert('Ошибка при удалении кинотеатра');
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

        document.getElementById('number_of_rows_subtitle').style.display = 'block';
        document.getElementById('number_of_rows').style.display = 'block';
        document.getElementById('number_of_seats_subtitle').style.display = 'block';
        document.getElementById('number_of_seats').style.display = 'block';

        document.querySelector('.content__schema').style.display = 'none';
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

        document.getElementById('number_of_rows_subtitle').style.display = 'none';
        document.getElementById('number_of_rows').style.display = 'none';
        document.getElementById('number_of_seats_subtitle').style.display = 'none';
        document.getElementById('number_of_seats').style.display = 'none';

        document.querySelector('.content__schema').style.display = 'none';
        
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

        document.getElementById('number_of_rows_subtitle').style.display = 'none';
        document.getElementById('number_of_rows').style.display = 'none';
        document.getElementById('number_of_seats_subtitle').style.display = 'none';
        document.getElementById('number_of_seats').style.display = 'none';

        document.querySelector('.content__schema').style.display = 'none';

         if(parseInt(select.value) != -1) setHalls();
    }
}

document.querySelectorAll('.option').forEach(option => {
    option.onclick = function(e){
        document.querySelector('.active_option').classList.toggle('active_option');
        e.currentTarget.classList.toggle('active_option');
        if(e.currentTarget.querySelector('.option__color').classList.contains('green')) optionSwitch = 'green';
        else if(e.currentTarget.querySelector('.option__color').classList.contains('orange')) optionSwitch = 'orange';
        else optionSwitch = 'purple';
    }
});

document.getElementById('hall_add').onclick = function(e){
    let hallNumber = document.getElementById('hall_input').value;
    let numberOfRows = document.getElementById('number_of_rows').value;
    let numberOfSeats = document.getElementById('number_of_seats').value;
    if(document.getElementById('cinema_select').value == -1){
        alert('Необходимо выбрать кинотеатр');
        return;
    }
    if(hallNumber == '' || parseInt(hallNumber) <= 0){
        alert('Номер зала должен быть числом, большим 0');
        return;
    }
    if(numberOfRows == '' || parseInt(numberOfRows) <= 0){
        alert('Количество рядов должно быть числом, большим 0');
        return;
    }
    if(numberOfSeats == '' || parseInt(numberOfSeats) <= 0){
        alert('Количество мест должно быть числом, большим 0');
        return;
    }
    numberOfRows = parseInt(numberOfRows);
    numberOfSeats = parseInt(numberOfSeats);
    document.getElementById('hall__number').innerHTML = `Редактор зала: Зал ${hallNumber}`;

    let hall = document.querySelector('.hall');
    hall.innerHTML = '';
    hall.insertAdjacentHTML('beforeend', '<div class="hall__screen">ЭКРАН</div>');

    let newSeats = [];

    for(let row = 0; row < numberOfRows; row++){
        let str = 
        `
        <div class="hall__row">
            <div class="row__number">${row + 1}</div>
        `;
        for(let seat = 0; seat < numberOfSeats; seat++){
            str +=
            `
            <div class="row__seat green" data-number="${seat+1}" data-row="${row+1}" data-tooltip="Ряд ${row+1}, место ${seat+1}"></div>
            `;
            newSeats.push(new SeatRequest(row+1, seat+1, 'Обычное'));
        }
        str += '</div>';
        hall.insertAdjacentHTML('beforeend', str);
    }

    newHall = new HallRequest(document.getElementById('cinema_select').value, hallNumber, newSeats);

    document.querySelectorAll('.row__seat').forEach(seat =>{
        seat.onclick = function(e){
            e.currentTarget.className = `row__seat ${optionSwitch}`;
            let row = e.currentTarget.dataset.row;
            let number = e.currentTarget.dataset.number;
            let type = 'Обычное';
            if(optionSwitch == 'orange') type = 'Эконом';
            else if(optionSwitch == 'purple') type = 'VIP';

            for(let key in newHall.seats){
                if(newHall.seats[key].number == number && newHall.seats[key].row == row){
                    newHall.seats[key].type = type;
                    break;
                }
            }
        }
    });

    document.getElementById('hall_btn').style.display = 'block';
    document.getElementById('hall_change_btn').style.display = 'none';
    document.getElementById('hall_delete_btn').style.display = 'none';

    document.querySelector('.content__schema').style.display = 'block';
}

document.getElementById('hall_change').onclick = getHall;
document.getElementById('hall_delete').onclick = getHall;

async function getHall(e){
    let deleteFlag = e.currentTarget.id == 'hall_delete' ? true : false;
    let hallId = document.getElementById('hall_select').value;
    let url = `http://127.0.0.1:${port}/api/halls/${hallId}`;
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
        let seats = [];
        json.seats.forEach(seat => {
            seats.push(new SeatRequest(seat.row, seat.number, seat.type));
        });
        seats.sort((a, b) => a.row - b.row || a.number - b.number);
        newHall = new HallRequest(json.cinemaId, json.number, seats);
        createSchema(deleteFlag);
    }
    else alert('Ошибка получения кинозала');
}

function createSchema(deleteFlag){
    let hall = document.querySelector('.hall');
    hall.innerHTML = '';
    hall.insertAdjacentHTML('beforeend', '<div class="hall__screen">ЭКРАН</div>');

    document.getElementById('hall__number').innerHTML = `Редактор зала: Зал ${newHall.number}`;

    const seatsByRow = {};
    
    newHall.seats.forEach(seat => {
        if (!seatsByRow[seat.row]) {
            seatsByRow[seat.row] = [];
        }
        seatsByRow[seat.row].push(seat);
    });
    
    const rowNumbers = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);

    rowNumbers.forEach(row =>{
        let str = 
        `
        <div class="hall__row">
            <div class="row__number">${row}</div>
        `;
        seatsByRow[row].forEach(seat => {
            let seatClass = '';
            switch(seat.type) {
                case 'Эконом':
                    seatClass = ' orange';
                    break;
                case 'Обычное':
                    seatClass = ' green';
                    break;
                case 'VIP':
                    seatClass = ' purple';
                    break;
                default:
                    seatClass = ' green';
            }
            str +=
            `
            <div class="row__seat ${seatClass}" data-number="${seat.number}" data-row="${row}" data-tooltip="Ряд ${row}, место ${seat.number}"></div>
            `;           
        });
        str += '</div>';
        hall.insertAdjacentHTML('beforeend', str);
    });

    if(!deleteFlag){
        document.querySelectorAll('.row__seat').forEach(seat =>{
            seat.onclick = function(e){
                e.currentTarget.className = `row__seat ${optionSwitch}`;
                let row = e.currentTarget.dataset.row;
                let number = e.currentTarget.dataset.number;
                let type = 'Обычное';
                if(optionSwitch == 'orange') type = 'Эконом';
                else if(optionSwitch == 'purple') type = 'VIP';

                for(let key in newHall.seats){
                    if(newHall.seats[key].number == number && newHall.seats[key].row == row){
                        newHall.seats[key].type = type;
                        break;
                    }
                }
            }
        });
    }

    document.getElementById('hall_btn').style.display = 'none';
    if(deleteFlag) {
        document.getElementById('hall_change_btn').style.display = 'none';
        document.getElementById('hall_delete_btn').style.display = 'block';
    }
    else{
        document.getElementById('hall_change_btn').style.display = 'block';
        document.getElementById('hall_delete_btn').style.display = 'none';
    }

    document.querySelector('.content__schema').style.display = 'block';
}

async function saveHall(){
    let url = `http://localhost:${port}/api/halls`;
    let response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(newHall),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        getCinemas();
    }
    else alert('Ошибка при добавлении кинозала');
}

async function updateHall(){
    let hallId = document.getElementById('hall_select').value;
    let url = `http://localhost:${port}/api/halls/${hallId}`;
    let response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(newHall),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
    }
    else alert('Ошибка при изменении кинозала');
}

async function deleteHall(){
    let hallId = document.getElementById('hall_select').value;
    let url = `http://localhost:${port}/api/halls/${hallId}`;
    let response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(response.ok) {
        alert('Успешно');
        getCinemas();
    }
    else alert('Ошибка при удалении кинозала');
}

getCinemas();
setNav();
