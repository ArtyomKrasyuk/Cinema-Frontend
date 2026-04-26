'use strict'

let port = 8000;

function setData(){
    document.getElementById('movie').innerHTML = localStorage.getItem('movieTitle');
    document.getElementById('cinema').innerHTML = localStorage.getItem('cinemaTitle');
    document.getElementById('datetime').innerHTML = `${localStorage.getItem('date')}, ${localStorage.getItem('time')} (${localStorage.getItem('hallType')})`;
    let container = document.querySelector('.selected_seats__container');
    container.innerHTML = '';
    JSON.parse(localStorage.getItem('selectedSeats')).forEach(seat => {
        let str = `<div class="selected_seat">Ряд ${seat.row}, место ${seat.number}</div>`;
        container.insertAdjacentHTML('beforeend', str);
    });
    document.getElementById('price').innerHTML = `${localStorage.getItem('price')} ₽`;
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
    window.location.href = 'sign_in.html';
    return;
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
        window.location.href = 'sign_in.html';
        return;
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
    alert("Ошибка аутентификации " + e);
  }

    window.location.href = 'sign_in.html';
    return;
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
setData();

document.querySelector('.form__btn').onclick = handlePayment;

// Константы для статусов
const Status = {
    CREATED: 'CREATED',
    PROCESSING: 'PROCESSING',
    CONFIRMED: 'CONFIRMED',
    EXPIRED: 'EXPIRED',
    FAILED: 'PAYMENT_FAILED'
};

async function handlePayment() {
    const paymentBtn = document.querySelector('.form__btn');
    const cardNumber = document.getElementById('card_number').value.trim();
    const expiration = document.getElementById('expiration').value.trim();
    const code = document.getElementById('code').value.trim();
    const orderId = localStorage.getItem('orderId');

    if (!cardNumber || !expiration || !code || !orderId) {
        alert('Пожалуйста, заполните все данные');
        return;
    }

    const paymentData = {
        cardNumber,
        expiration,
        code,
        orderId: parseInt(orderId, 10)
    };

    try {
        // Блокируем кнопку на время запроса
        paymentBtn.style.opacity = '0.5';
        paymentBtn.style.pointerEvents = 'none';
        paymentBtn.innerText = 'Отправка...';

        const response = await fetchWithAuth('http://localhost:8000/api/payment', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });

        if (response && response.ok) {
            paymentBtn.innerText = 'Ожидание подтверждения...';
            // Запускаем опрос сервера
            startPollingStatus(orderId, paymentBtn);
        } else {
            throw new Error('Ошибка при отправке данных');
        }
    } catch (error) {
        console.error('Ошибка платежа:', error);
        alert('Не удалось отправить данные карты');
        resetButton(paymentBtn);
    }
}

function showModalResult(message, isSuccess) {
    const modal = document.getElementById('modal_result');
    const msg = document.getElementById('modal_message');
    const icon = document.getElementById('modal_icon');
    const close = document.getElementById('modal_close');
    msg.textContent = message;
    icon.innerHTML = isSuccess ? '✔️' : '❌';
    icon.className = 'modal__icon ' + (isSuccess ? 'success' : 'error');
    modal.style.display = 'flex';
    close.onclick = function() {
        modal.style.display = 'none';
        if (isSuccess) window.location.href = 'index.html';
    };
    // Закрытие по клику вне окна
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (isSuccess) window.location.href = 'index.html';
        }
    };
}

async function startPollingStatus(orderId, btnElement) {
    const pollInterval = 3000; 
    const checkStatus = async () => {
        try {
            const response = await fetchWithAuth(`http://localhost:8000/api/orders/status/${orderId}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Ошибка сети');
            const data = await response.json(); 
            const currentStatus = data.status; // Достаем статус из объекта {"status": "..."}
            console.log(`Статус заказа ${orderId}: ${currentStatus}`);
            switch (currentStatus) {
                case Status.CONFIRMED:
                    showModalResult('Оплата успешно подтверждена!', true);
                    break;
                case Status.PAYMENT_FAILED:
                    showModalResult('Ошибка! Платеж отклонен.', false);
                    resetButton(btnElement);
                    break;
                case Status.EXPIRED:
                    showModalResult('Срок оплаты заказа истек.', false);
                    resetButton(btnElement);
                    break;
                case Status.PROCESSING:
                case Status.CREATED:
                    setTimeout(checkStatus, pollInterval);
                    break;
                default:
                    showModalResult('Неизвестный статус оплаты.', false);
                    setTimeout(checkStatus, pollInterval);
            }
        } catch (error) {
            console.error('Ошибка опроса:', error);
            setTimeout(checkStatus, 5000);
        }
    };
    checkStatus();
}

// Вспомогательная функция для возврата кнопки в рабочее состояние
function resetButton(btn) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.innerText = 'Подтвердить оплату';
}