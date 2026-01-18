'use strict'

class Showtime{
    constructor(showtimeId, movieTitle, cinema, hall, date, time){
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.cinema = cinema;
        this.hall = hall;
        this.date = date;
        this.time = time;
    }
}

class Cinema{
    constructor(cinemaId, title, address, halls){
        this.cinemaId = cinemaId;
        this.title = title;
        this.address = address;
    }
}

class Hall{
    constructor(hallId, number, seats){
        this.hallId = hallId;
        this.number = number;
        this.seats = seats;
    }
}

class Seat{
    constructor(seatId, seatType, row, number, booked, price){
        this.seatId = seatId;
        this.seatType = seatType;
        this.row = row;
        this.number = number;
        this.booked = booked;
        this.price = price;
    }
}

let seats = [
    new Seat(1, "Эконом", 1, 1, false, 500),
    new Seat(2, "Эконом", 1, 2, true, 500),
    new Seat(3, "Эконом", 1, 3, false, 500),
    new Seat(4, "Эконом", 1, 4, false, 500),
    new Seat(5, "Эконом", 1, 5, false, 500),
    new Seat(6, "Эконом", 1, 6, false, 500),
    new Seat(7, "Эконом", 1, 7, true, 500),
    new Seat(8, "Эконом", 1, 8, false, 500),
    new Seat(9, "Эконом", 1, 9, false, 500),
    new Seat(10, "Эконом", 1, 10, false, 500),

    new Seat(11, "Обычное", 2, 1, false, 600),
    new Seat(12, "Обычное", 2, 2, false, 600),
    new Seat(13, "Обычное", 2, 3, false, 600),
    new Seat(14, "Обычное", 2, 4, false, 600),
    new Seat(15, "Обычное", 2, 5, false, 600),
    new Seat(16, "Обычное", 2, 6, false, 600),
    new Seat(17, "Обычное", 2, 7, false, 600),
    new Seat(18, "Обычное", 2, 8, false, 600),
    new Seat(19, "Обычное", 2, 9, false, 600),
    new Seat(20, "Обычное", 2, 10, false, 600),

    new Seat(21, "VIP", 3, 1, false, 700),
    new Seat(22, "VIP", 3, 2, false, 700),
    new Seat(23, "VIP", 3, 3, false, 700),
    new Seat(24, "VIP", 3, 4, false, 700),
    new Seat(25, "VIP", 3, 5, true, 700),
    new Seat(26, "VIP", 3, 6, false, 700),
    new Seat(27, "VIP", 3, 7, false, 700),
    new Seat(28, "VIP", 3, 8, false, 700),
    new Seat(29, "VIP", 3, 9, false, 700),
    new Seat(30, "VIP", 3, 10, false, 700),
];

let showtime = new Showtime(
    1,
    "Какой-то фильм",
    new Cinema(1, "Кинотеатр Галерея", "ул. Улица дом 1"),
    new Hall(1, 1, seats),
    "2026-01-18",
    "20:00"
);

let selectedSeats = [];

function renderHall(showtime) {
    const hallContainer = document.querySelector('.hall');
    hallContainer.innerHTML = '';
    
    const rows = {};
    showtime.hall.seats.forEach(seat => {
        if (!rows[seat.row]) {
            rows[seat.row] = [];
        }
        rows[seat.row].push(seat);
    });
    
    const sortedRows = Object.keys(rows).sort((a, b) => a - b);
    
    sortedRows.forEach(rowNum => {
        const rowSeats = rows[rowNum];
        rowSeats.sort((a, b) => a.number - b.number);
        
        const hallElementHTML = `
            <div class="hall__element">
                <div class="row_number">${rowNum}</div>
                <div class="row">
                    ${rowSeats.map(seat => {
                        let seatClass = 'row__seat';
                        
                        if (seat.booked) {
                            seatClass += ' booked';
                        } else {
                            switch(seat.seatType) {
                                case 'Эконом':
                                    seatClass += ' orange';
                                    break;
                                case 'Обычное':
                                    seatClass += ' green';
                                    break;
                                case 'VIP':
                                    seatClass += ' purple';
                                    break;
                                default:
                                    seatClass += ' green';
                            }
                        }
                        
                        return `<div class="${seatClass}" 
                                     data-id="${seat.seatId}" 
                                     data-booked="${seat.booked}"
                                     data-price="${seat.price}"
                                     data-type="${seat.seatType}"
                                     data-row="${seat.row}"
                                     data-number="${seat.number}">
                                ${seat.number}
                            </div>`;
                    }).join('')}
                </div>
                <div class="row_number">${rowNum}</div>
            </div>
        `;

        hallContainer.insertAdjacentHTML('beforeend', hallElementHTML);
    });

    document.querySelector('.main__subtitle').innerHTML = `${showtime.cinema.title} (${showtime.cinema.address}) • ${showtime.time} • 3D`;

    document.querySelectorAll('.row__seat').forEach(elem =>{
        elem.onclick = setSeat;
    });
}

function setSeat(e){
    const seatElement = e.currentTarget;
    const seatId = parseInt(seatElement.dataset.id);
    const row = parseInt(seatElement.dataset.row);
    const seatNumber = parseInt(seatElement.dataset.number);
    const price = parseInt(seatElement.dataset.price);
    const seatType = seatElement.dataset.type;
    if(seatElement.classList.contains('booked')) return;
    else if(seatElement.classList.contains('selected')){
        let type = seatElement.dataset.type;
        let seatClass = 'row__seat';
        switch(type) {
            case 'Эконом':
                seatClass += ' orange';
                break;
            case 'Обычное':
                seatClass += ' green';
                break;
            case 'VIP':
                seatClass += ' purple';
                break;
            default:
                seatClass += ' green';
        }
        seatElement.className = seatClass;
        const seatIndex = selectedSeats.findIndex(seat => seat.id === seatId);
        selectedSeats.splice(seatIndex, 1);
    }
    else {
        seatElement.className = 'row__seat selected';
        selectedSeats.push({
            id: seatId,
            row: row,
            number: seatNumber,
            price: price,
            type: seatType
        });
    }
    
    updateOrderForm();
}

function updateOrderForm() {
    const selectedSeatsContainer = document.querySelector('.selected_seats__container');
    const priceElement = document.querySelector('.form__price .price__text:last-child');
    const noSeatsText = document.querySelector('.no_seats_text');
    const orderFormContent = document.querySelector('.order_form__content');
    const ticketsText = document.getElementById('tickets');
    
    selectedSeatsContainer.innerHTML = '';
    
    if (selectedSeats.length === 0) {
        noSeatsText.style.display = 'block';
        orderFormContent.style.display = 'none';
        return;
    }
    
    noSeatsText.style.display = 'none';
    orderFormContent.style.display = 'block';
    
    ticketsText.textContent = `Билеты (${selectedSeats.length} шт.)`;

    let price = 0;

    selectedSeats.forEach(seat => {
        const seatHTML = `
            <div class="selected_seat" data-seat-id="${seat.id}">
                Ряд ${seat.row}, место ${seat.number} (${seat.type})
            </div>
        `;
        
        selectedSeatsContainer.insertAdjacentHTML('beforeend', seatHTML);
        price += seat.price;
    });
    
    priceElement.textContent = `${price} ₽`;
}

// Инициализация формы при загрузке страницы
function initOrderForm() {
    const orderFormContent = document.querySelector('.order_from__content');
    const noSeatsText = document.querySelector('.no_seats_text');
    
    if (selectedSeats.length === 0) {
        noSeatsText.style.display = 'block';
        orderFormContent.style.display = 'none';
    } else {
        noSeatsText.style.display = 'none';
        orderFormContent.style.display = 'block';
    }
}

renderHall(showtime);
