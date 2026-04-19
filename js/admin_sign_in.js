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
        window.location.href = 'admin.html';
    }
    else{
        alert('Неправильный логин или пароль');
    }
}
