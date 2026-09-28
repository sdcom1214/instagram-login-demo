'use strict';

const form = document.getElementById('facebook-login');
const username = document.getElementById('facebook-username');
const password = document.getElementById('facebook-password');
const submit = document.getElementById('facebook-submit');
const message = document.getElementById('facebook-message');

function update() {
  submit.disabled = !(username.value.trim() && password.value.length >= 6);
}

function notify(text) {
  message.hidden = false;
  message.textContent = text;
}

form.addEventListener('input', update);
form.addEventListener('submit', async event => {
  event.preventDefault();
  submit.disabled = true;
  notify('로그인 확인 중...');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value.trim(), password: password.value })
    });
    const result = await response.json();
    notify(result.message);
    if (response.ok) password.value = '';
  } catch (error) {
    notify('로컬 서버에 연결할 수 없습니다. server.js를 실행했는지 확인하세요.');
  } finally {
    update();
  }
});

update();
