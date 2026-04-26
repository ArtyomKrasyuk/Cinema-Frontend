'use strict'

let port = 8000;

document.querySelector('.eye').addEventListener('click', function() {
    const password = document.getElementById('password');
    password.type = password.type === 'password' ? 'text' : 'password';
});


document.querySelector('.form__btn').onclick = async function(e){
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let body = {
        'login': email,
        'password': password
    }

    const response = await fetch(`http://localhost:${port}/auth`, {
        method: "POST",
        headers: {
        'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        window.location.href = 'index.html';
    }
    else{
        showModalResult('Неправильный логин или пароль', false);
    }
}

// Модальное окно для сообщений (универсальное)
function showModalResult(message, isSuccess = null, onClose = null) {
    const modal = document.getElementById('modal_result');
    const msg = document.getElementById('modal_message');
    const icon = document.getElementById('modal_icon');
    const close = document.getElementById('modal_close');
    msg.textContent = message;
    if (isSuccess === true) {
        icon.innerHTML = '✔️';
        icon.className = 'modal__icon success';
    } else if (isSuccess === false) {
        icon.innerHTML = '❌';
        icon.className = 'modal__icon error';
    } else {
        icon.innerHTML = '';
        icon.className = 'modal__icon';
    }
    modal.style.display = 'flex';
    close.onclick = function() {
        modal.style.display = 'none';
        if (onClose) onClose();
    };
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (onClose) onClose();
        }
    };
}