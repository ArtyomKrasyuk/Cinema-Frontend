'use strict'

function setData(){
    document.getElementById('movie').innerHTML = localStorage.getItem('movieTitle');
    document.getElementById('cinema').innerHTML = localStorage.getItem('cinemaTitle');
    document.getElementById('datetime').innerHTML = `${localStorage.getItem('date')}, ${localStorage.getItem('time')} (${localStorage.getItem('hallType')})`;
    let container = document.querySelector('.selected_seats__container');
    container.innerHTML = '';
    localStorage.getItem('selectedSeats').forEach(seat => {
        let str = `<div class="selected_seat">Ряд ${seat.row}, место ${seat.number}</div>`;
        container.insertAdjacentHTML('beforeend', str);
    });
    document.querySelector('.price__text').innerHTML = `${localStorage.getItem('price')} ₽`;
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

//setHeader();
