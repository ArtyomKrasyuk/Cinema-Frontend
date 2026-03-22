'use strict'

let port = 8000;

document.addEventListener('DOMContentLoaded', () => {
    // Элементы отображения
    const displayValues = document.querySelectorAll('.profile_card__value');
    const btnEdit = document.querySelector('.profile_card__btn');
    const btnCancel = document.querySelector('.changes__cancel');
    const btnSubmit = document.querySelector('.changes__submit');
    
    // Элементы формы
    const infoBlock = document.querySelector('.profile_card__information');
    const editForm = document.querySelector('.profile_card__changes');
    const inputs = document.querySelectorAll('.input_container__input');

    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        try {
            // Декодируем Payload токена
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const userData = JSON.parse(window.atob(base64));

            // Извлекаем данные согласно вашей структуре
            const fullName = userData.name || "Пользователь";
            const email = userData.email || "Email не указан";

            // Функция заполнения данных в HTML
            const updateUI = () => {
                // Текст в карточке (Имя и Email)
                displayValues[0].textContent = fullName;
                displayValues[1].textContent = email;

                // Значения в инпутах (Имя и Email)
                inputs[0].value = fullName;
                inputs[1].value = email;
            };

            updateUI();

        } catch (e) {
            console.error("Ошибка парсинга токена:", e);
        }
    }

    // --- Логика интерфейса ---

    // Кнопка "Редактировать"
    btnEdit.addEventListener('click', () => {
        infoBlock.classList.add('hidden');
        editForm.classList.remove('hidden');
    });

    // Кнопка "Отмена"
    btnCancel.addEventListener('click', () => {
        editForm.classList.add('hidden');
        infoBlock.classList.remove('hidden');
    });

    // Кнопка "Сохранить" (заглушка для логики обновления)
    btnSubmit.addEventListener('click', () => {
        // Здесь обычно идет fetch запрос к API Keycloak или вашему бэкенду
        alert("Запрос на сохранение отправлен!");
        editForm.classList.add('hidden');
        infoBlock.classList.remove('hidden');
    });
});

loadUserOrders();

async function loadUserOrders() {
    if(await checkAuth()){
        document.querySelector('.header__buttons').style.display = 'none';
        document.querySelector('.profile').style.display = 'block';
    }
    else{
        window.location.href = 'sign_in.html';
        return;
    }

    try {
        const response = await authorizedFetch('http://localhost:8000/api/orders');
        if (!response.ok) throw new Error('Не удалось загрузить бронирования');
        
        const orders = await response.json();
        
        // Находим контейнеры (карточки профиля)
        // Предположим, первый блок .profile_card — активные, второй — история
        const profileCards = document.querySelectorAll('.profile_card');
        const activeContainer = profileCards[1];
        const historyContainer = profileCards[2];

        // Очищаем старые билеты, оставляя только заголовок и подзаголовок
        clearTickets(activeContainer);
        clearTickets(historyContainer);

        let activeCount = 0;
        let historyCount = 0;
        const now = new Date();

        orders.forEach(order => {
            const orderDate = new Date(order.time);
            const isExpired = orderDate < now;
            const isCancelled = order.state === 'CANCELLED';

            if (!isExpired && !isCancelled) {
                activeContainer.insertAdjacentHTML('beforeend', createTicketHtml(order, false));
                activeCount++;
            } else {
                historyContainer.insertAdjacentHTML('beforeend', createTicketHtml(order, true, isCancelled));
                historyCount++;
            }
        });

        // Обновляем счетчики в заголовках
        updateCounter(activeContainer, activeCount);
        updateCounter(historyContainer, historyCount);

    } catch (error) {
        console.error("Ошибка:", error);
    }
}

function createTicketHtml(order, isHistory, isCancelled = false) {
    const dateObj = new Date(order.time);
    const dateStr = dateObj.toLocaleDateString('ru-RU');
    const timeStr = dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    // Генерируем блоки для мест (ряд-место)
    const seatsHtml = order.seats
        .map(s => `<div class="card__place">${s.seatRow}-${s.seatNumber}</div>`)
        .join('');

    // Статус для истории
    const statusHtml = isCancelled ? `<p class="card__status">Отменено</p>` : '';

    // Правая часть (кнопки только для активных)
    const rightSideHtml = isHistory 
        ? `<div class="card__price">${order.price} ₽</div>`
        : `
            <div class="card__price">${order.price} ₽</div>
            <button class="card__cancel clickable" onclick="cancelOrder(${order.orderId})">Отменить</button>
            <button class="card__download clickable">Скачать билет</button>
        `;

    return `
        <div class="ticket_card">
            <div class="ticket_card__left">
                <div class="card__container">
                    <img src="img/movie16.png" alt="Фильм" width="16" height="16"/>
                    <h2 class="card__title">${order.movieTitle}</h2>
                    ${statusHtml}
                </div>
                <div class="card__container">
                    <img src="img/location16.png" alt="Место" width="16" height="16"/>
                    <p class="card__text text_margin">${order.cinemaTitle}, Зал ${order.hallNumber}</p>
                </div>
                <div class="card__row">
                    <div class="card__container">
                        <img src="img/calendar16.png" alt="Дата" width="16" height="16"/>
                        <p class="card__text">${dateStr}</p>
                    </div>
                    <div class="card__container container_margin">
                        <img src="img/time16.png" alt="Время" width="16" height="16"/>
                        <p class="card__text">${timeStr}</p>
                    </div>
                </div>
                <div class="card__row">
                     <p class="card__text">Места:</p>
                     ${seatsHtml}
                </div>
            </div>
            <div class="ticket_card__right">
                ${rightSideHtml}
            </div>
        </div>
    `;
}

async function authorizedFetch(url, options = {}) {
    let accessToken = localStorage.getItem("access_token");

    // Инициализируем headers, если их нет
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json;charset=utf-8'
    };

    let response = await fetch(url, options);

    // Если 401 (Токен истек)
    if (response.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
            window.location.href = 'sign_in.html';
            return;
        }
        const refreshResponse = await fetch(`http://localhost:${port}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ token: refreshToken })
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            // Повторный запрос с новым токеном
            options.headers['Authorization'] = `Bearer ${localStorage.getItem("access_token")}`;
            return await fetch(url, options);
        } else {
            // Если и refresh не помог — на выход
            localStorage.clear();
            window.location.href = 'sign_in.html';
        }
    }

    return response;
}

// Вспомогательные функции
function clearTickets(container) {
    const tickets = container.querySelectorAll('.ticket_card');
    tickets.forEach(t => t.remove());
}

function updateCounter(container, count) {
    const title = container.querySelector('.profile_card__title');
    if (title) {
        title.textContent = title.textContent.replace(/\(\d+\)/, `(${count})`);
    }
}

async function cancelOrder(orderId) {
    // 1. Подтверждение действия у пользователя
    const isConfirmed = confirm("Вы уверены, что хотите отменить бронирование? Средства будут возвращены на ваш счет.");
    
    if (!isConfirmed) return;

    try {
        // 2. Отправка запроса через нашу обертку с авторизацией
        const response = await authorizedFetch(`http://localhost:${port}/api/payment/refund/${orderId}`, {
            method: 'POST'
        });

        if (response.ok) {
            alert("Заказ успешно отменен. Средства возвращены.");
            
            // 3. Перерисовываем интерфейс, чтобы заказ переместился в историю со статусом CANCELLED
            await renderOrders(); 
        } else {
            // Обработка ошибок от сервера (например, если сеанс уже начался и отмена невозможна)
            const errorData = await response.json().catch(() => ({}));
            alert(`Ошибка при отмене: ${errorData.message || "попробуйте позже"}`);
        }
    } catch (error) {
        console.error("Ошибка сети при отмене заказа:", error);
        alert("Не удалось связаться с сервером для отмены бронирования.");
    }
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ token: refreshToken })
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