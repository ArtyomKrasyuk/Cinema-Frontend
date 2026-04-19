'use strict'

let port = 8000;

document.getElementById('eye1').addEventListener('click', function() {
    const password = document.getElementById('first_password');
    password.type = password.type === 'password' ? 'text' : 'password';
});

document.getElementById('eye2').addEventListener('click', function() {
    const password = document.getElementById('second_password');
    password.type = password.type === 'password' ? 'text' : 'password';
});

document.querySelector('.form__btn').onclick = async function(e){
    let email = document.getElementById('email').value;
    let firstPassword = document.getElementById('first_password').value;
    let secondPassword = document.getElementById('second_password').value;
    let firstName = document.getElementById('first_name').value;
    let lastName = document.getElementById('last_name').value;

    if(firstPassword !== secondPassword){
        document.querySelector('.error').innerHTML = 'Пароли не совпадают';
        document.querySelector('.error').style.display = 'block';
        return;
    }

    let body = {
        'firstname': firstName,
        'lastname': lastName,
        'login': email,
        'password': firstPassword
    }

    const response = await fetch(`http://localhost:${port}/reg`, {
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
        alert('Ошибка регистрации');
    }
}