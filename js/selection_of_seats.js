'use strict'

class Showtime{
    constructor(showtimeId, movieTitle, cinemaTitle, cinemaAddress, hall, date, time, basePrice){
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.cinemaTitle = cinemaTitle;
        this.cinemaAddress = cinemaAddress;
        this.hall = hall;
        this.date = date;
        this.time = time;
        this.basePrice = basePrice;
    }
}

class Hall{
    constructor(hallId, number, seats, hallTypeFactor, hallType){
        this.hallId = hallId;
        this.number = number;
        this.seats = seats;
        this.hallTypeFactor = hallTypeFactor;
        this.hallType = hallType;
    }
}

class Seat{
    constructor(seatId, seatType, row, number, booked, factor){
        this.seatId = seatId;
        this.seatType = seatType;
        this.row = row;
        this.number = number;
        this.booked = booked;
        this.factor = factor;
    }
}

let showtime = null;

let selectedSeats = [];

let port = 8000;
let showtimeId = getUrlParameter("showtimeId");

// Функция для получения забронированных мест
async function fetchReservedSeats(showtimeId) {
    try {
        const response = await fetch(`http://localhost:${port}/api/orders/reserved/${showtimeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // data - это объект ReservedSeatsResponseDTO с полем seatIds
        return new Set(data.seatIds || []);
        
    } catch (error) {
        alert(`Ошибка получения забронированных мест: ${error}`);
        return new Set(); // Возвращаем пустой Set в случае ошибки
    }
}

// Функция для создания объекта Seat из DTO
function createSeatFromDTO(seatDTO, isBooked = false) {
    return new Seat(
        seatDTO.seatId,
        seatDTO.type,      // seatType из type
        seatDTO.row,
        seatDTO.number,
        isBooked,          // флаг бронирования
        seatDTO.factor
    );
}

// Функция для создания объекта Hall из DTO
function createHallFromDTO(hallDTO, reservedSeatIds = new Set()) {
    // Создаем массив объектов Seat, помечая забронированные
    const seats = hallDTO.seats.map(seatDTO => {
        const isBooked = reservedSeatIds.has(seatDTO.seatId);
        return createSeatFromDTO(seatDTO, isBooked);
    });
    
    return new Hall(
        hallDTO.hallId,
        hallDTO.number,
        seats,
        hallDTO.hallTypeFactor,
        hallDTO.hallType
    );
}

// Функция для создания объекта Showtime из DTO
function createShowtimeFromDTO(showtimeDTO, reservedSeatIds = new Set()) {
    // Создаем объект Hall с учетом забронированных мест
    const hall = createHallFromDTO(showtimeDTO.hall, reservedSeatIds);
    
    
    const [year, month, day] = showtimeDTO.time.split(' ')[0].split('-');
    let date = `${day}.${month}.${year}`;
    let time = showtimeDTO.time.split(' ')[1].substring(0, 5);
    
    
    return new Showtime(
        showtimeDTO.showtimeId,
        showtimeDTO.movieTitle,
        showtimeDTO.cinemaTitle,
        showtimeDTO.cinemaAddress,
        hall,
        date,
        time,
        showtimeDTO.basePrice
    );
}

// Функция для получения одного сеанса
async function fetchShowtime(showtimeId) {
    const response = await fetch(`http://localhost:${port}/api/showtimes/hall/${showtimeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
       alert("Ошибка в получении киносеанса");
       return;
    }

    return await response.json();
}

// Основная функция для получения одного сеанса с бронированиями
async function fetchShowtimeWithReservations(showtimeId) {
    // Получаем данные параллельно
    const [showtimeDTO, reservedSeatIds] = await Promise.all([
        fetchShowtime(showtimeId),
        fetchReservedSeats(showtimeId)
    ]);

    showtime = createShowtimeFromDTO(showtimeDTO, reservedSeatIds);

    renderHall(showtime);
}

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
                                     data-price="${Math.ceil(showtime.basePrice * showtime.hall.hallTypeFactor * seat.factor)}"
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

    document.querySelector('.main__subtitle').innerHTML = `${showtime.cinemaTitle} (${showtime.cinemaAddress}) • ${showtime.date} • ${showtime.time} • ${showtime.hall.hallType}`;

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

document.querySelector('.form__btn').onclick = createOrder;

async function createOrder() {
    const [day, month, year] = date.split('.');
    let dateFormatted = `${year}-${month}-${day}`;
    let price = 0;
    let seats = [];
    selectedSeats.forEach(seat => {
        price += seat.price;
        seats.push({
            'seatId': seat.id,
            'seatNumber': seat.number,
            'seatRow': seat.row,
            'showtimeId': showtime.showtimeId
        });
    });
    let data = {
        'showtimeId': showtime.showtimeId,
        'movieTitle': showtime.movieTitle,
        'cinemaTitle': showtime.cinemaTitle,
        'hallNumber': showtime.hall.number,
        'time': `${dateFormatted} ${showtime.time}`,
        'price': price,
        'seats': seats
    }

    let url = `http://localhost:${port}/api/orders`;
    let response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if(response.ok) {
        const result = await response.json();
        localStorage.setItem('orderId', result.orderId);
        localStorage.setItem('expiresAt', result.expiresAt);
        localStorage.setItem('price', result.price);

        localStorage.setItem('selectedSeats', selectedSeats);
        localStorage.setItem('movieTitle', showtime.movieTitle);
        localStorage.setItem('cinemaTitle', showtime.cinemaTitle);
        localStorage.setItem('date', showtime.date);
        localStorage.setItem('time', showtime.time);
        localStorage.setItem('hallType', showtime.hall.hallType);
        window.location.href = 'payment';
    }
    else alert('Ошибка при создании заказа');
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
        window.location.href = 'sign_in.html';
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
        window.location.href = 'sign_in.html';
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
        window.location.href = 'sign_in.html';
        return;
    }

    const data = await refreshResponse.json();

    // Сохраняем новые токены
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    // Повторяем исходный запрос с новым токеном
    return await executeRequest(data.access_token);

}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

fetchShowtimeWithReservations(getUrlParameter('showtimeId'));

document.querySelector('.sign_in_btn').onclick = function(e){
    window.location.href = 'sign_in.html';
}

document.querySelector('.sign_up_btn').onclick = function(e){
    window.location.href = 'sign_up.html';
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