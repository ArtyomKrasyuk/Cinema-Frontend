'use strict'

function b64DecodeUnicode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return decodeURIComponent(
        atob(str)
            .split('')
            .map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );
}

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
            const userData = JSON.parse(b64DecodeUnicode(base64Url));

            // Извлекаем данные согласно вашей структуре
            const fullName = userData.name || "Пользователь";
            const email = userData.email || "Email не указан";
            const firstName = userData.given_name || "Имя не указано";
            const lastName = userData.family_name || "Фамилия не указана";

            // Функция заполнения данных в HTML
            const updateUI = () => {
                // Текст в карточке (Имя и Email)
                displayValues[0].textContent = fullName;
                displayValues[1].textContent = email;

                // Значения в инпутах (Имя и Email)
                inputs[0].value = firstName;
                inputs[1].value = lastName;
                inputs[2].value = email;
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

    // Кнопка "Изменить профиль" — отправка PUT-запроса на /profile
    const changeProfileBtn = document.getElementById('change_profile');
    if (changeProfileBtn) {
        changeProfileBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const firstNameEl = document.getElementById('firstName');
            const lastNameEl = document.getElementById('lastName');

            const firstName = firstNameEl ? firstNameEl.value.trim() : '';
            const lastName = lastNameEl ? lastNameEl.value.trim() : '';

            try {
                const response = await authorizedFetch(`http://localhost:${port}/profile`, {
                    method: 'PUT',
                    body: JSON.stringify({ firstName, lastName })
                });

                if (response && response.ok) {
                    alert('Профиль успешно обновлён');

                    // После изменения профиля — обновляем токены
                    try {
                        const refreshToken = localStorage.getItem("refresh_token");
                        if (refreshToken) {
                            const refreshResponse = await fetch(`http://localhost:${port}/refresh`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json;charset=utf-8' },
                                body: JSON.stringify({ token: refreshToken })
                            });
                            if (refreshResponse.ok) {
                                const data = await refreshResponse.json();
                                localStorage.setItem("access_token", data.access_token);
                                localStorage.setItem("refresh_token", data.refresh_token);
                            } else {
                                localStorage.clear();
                                window.location.href = 'sign_in.html';
                                return;
                            }
                        }
                    } catch (e) {
                        localStorage.clear();
                        window.location.href = 'sign_in.html';
                        return;
                    }

                    // Обновляем UI: комбинируем имя и фамилию
                    const fullName = `${firstName} ${lastName}`.trim();
                    if (displayValues && displayValues[0]) displayValues[0].textContent = fullName || displayValues[0].textContent;

                    if (inputs && inputs[0] && firstName) inputs[0].value = firstName;
                    if (lastNameEl) lastNameEl.value = lastName;

                    editForm.classList.add('hidden');
                    infoBlock.classList.remove('hidden');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    alert(`Ошибка при обновлении профиля: ${errorData.message || 'попробуйте позже'}`);
                }
            } catch (err) {
                console.error('Ошибка сети при обновлении профиля:', err);
                alert('Не удалось связаться с сервером.');
            }
        });
    }

    // Кнопка "Изменить пароль"
    const changePasswordBtn = document.getElementById('change_password');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const oldPasswordEl = document.getElementById('currentPassword');
            const newPasswordEl = document.getElementById('newPassword');
            const confirmPasswordEl = document.getElementById('confirmPassword');

            const oldPassword = oldPasswordEl ? oldPasswordEl.value : '';
            const newPassword = newPasswordEl ? newPasswordEl.value : '';
            const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : '';

            if (newPassword !== confirmPassword) {
                alert('Новый пароль и подтверждение не совпадают!');
                return;
            }

            try {
                const response = await authorizedFetch(`http://localhost:${port}/password`, {
                    method: 'PUT',
                    body: JSON.stringify({ oldPassword, newPassword })
                });
                if (response && response.ok) {
                    alert('Пароль успешно изменён!');
                    // Можно очистить поля формы
                    if (oldPasswordEl) oldPasswordEl.value = '';
                    if (newPasswordEl) newPasswordEl.value = '';
                    if (confirmPasswordEl) confirmPasswordEl.value = '';
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    alert(`Ошибка при изменении пароля: ${errorData.message || 'попробуйте позже'}`);
                }
            } catch (err) {
                console.error('Ошибка сети при изменении пароля:', err);
                alert('Не удалось связаться с сервером.');
            }
        });
    }
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

        document.querySelectorAll('.card__download').forEach(elem => {
            elem.onclick = setTickets;
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
                        <p class="card__text date">${dateStr}</p>
                    </div>
                    <div class="card__container container_margin">
                        <img src="img/time16.png" alt="Время" width="16" height="16"/>
                        <p class="card__text time">${timeStr}</p>
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

const { jsPDF } = window.jspdf;
 
function setTickets(e) {
    // Получаем .ticket_card, в котором была нажата кнопка
    const ticketCard = e.target.closest('.ticket_card');
    if (!ticketCard) {
        alert('Не удалось найти данные билета');
        return;
    }
    // Фильм
    const movieTitle = ticketCard.querySelector('.card__title')?.textContent?.trim() || '';
    // Кинотеатр и зал
    const cinemaInfo = ticketCard.querySelector('.card__text.text_margin')?.textContent?.trim() || '';
    let cinemaTitle = '', hallNumber = '';
    const cinemaMatch = cinemaInfo.match(/(.+), Зал (\d+)/);
    if (cinemaMatch) {
        cinemaTitle = cinemaMatch[1];
        hallNumber = cinemaMatch[2];
    }
    // Дата
    const date = ticketCard.querySelector('.date')?.textContent?.trim() || '';
    // Время
    const time = ticketCard.querySelector('.time')?.textContent?.trim() || '';
    // Места (берём все .card__place)
    const places = Array.from(ticketCard.querySelectorAll('.card__place')).map(el => el.textContent.trim());
    let seatRow = '', seatNumber = '';
    if (places.length > 0) {
        [seatRow, seatNumber] = places[0].split('-');
    }
    // Цена
    const price = ticketCard.querySelector('.card__price')?.textContent?.replace(/[^\d]/g, '') || '';
    // Номер билета (можно сгенерировать или взять из данных)
    const ticketNumber = 'CIN' + Math.floor(Math.random() * 1000000);
    // Имя пользователя (можно взять из профиля)
    const userName = document.querySelector('#firstName')?.value + ' ' + document.querySelector('#lastName')?.value;

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    doc.setFont('Roboto', 'normal');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Верхний блок
    doc.setFillColor(0, 102, 204);
    doc.rect(0, y, pageWidth, 25, 'F');
    doc.setFontSize(40);
    doc.setTextColor(255, 255, 255);
    doc.text('БИЛЕТ В КИНО', pageWidth / 2, y + 17, { align: 'center' });

    // Основная информация
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    let infoY = y + 40;
    doc.text(`Фильм: ${movieTitle}`, 20, infoY);
    doc.text(`Кинотеатр: ${cinemaTitle}`, 20, infoY + 12);
    doc.text(`Зал: ${hallNumber}`, 20, infoY + 24);
    doc.text(`Места: ${places.join(', ')}`, 20, infoY + 36);
    doc.text(`Дата: ${date}   Время: ${time}`, 20, infoY + 48);
    doc.text(`Покупатель: ${userName}`, 20, infoY + 60);
    doc.text(`Цена: ${price} ₽`, 20, infoY + 72);
    doc.text(`Номер билета: ${ticketNumber}`, 20, infoY + 84);

    // Генерация QR-кода
    const qrDiv = document.createElement('div');
    new QRCode(qrDiv, {
        text: ticketNumber,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.H
    });
    setTimeout(() => {
        const qrImg = qrDiv.querySelector('img') || qrDiv.querySelector('canvas');
        if (qrImg) {
            let qrDataUrl;
            if (qrImg.tagName === 'IMG') {
                qrDataUrl = qrImg.src;
            } else {
                qrDataUrl = qrImg.toDataURL('image/png');
            }
            doc.addImage(qrDataUrl, 'PNG', 150, infoY + 10, 80, 80);
        }
        doc.save(`ticket_${ticketNumber}.pdf`);
    }, 200);
}