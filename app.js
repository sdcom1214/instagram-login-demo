'use strict';
const form=document.getElementById('login');
const username=document.getElementById('username');
const password=document.getElementById('password');
const submit=document.getElementById('submit');
const reveal=document.getElementById('reveal');
const message=document.getElementById('message');
function update(){submit.disabled=!(username.value.trim()&&password.value.length>=6);reveal.hidden=!password.value;}
form.addEventListener('input',update);
reveal.addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';reveal.textContent=show?'숨기기':'비밀번호 표시';});
function notify(text){message.hidden=false;message.textContent=text;}
form.addEventListener('submit',async e=>{
	e.preventDefault();
	submit.disabled=true;
	notify('로그인 확인 중...');
	try{
		const response=await fetch('/api/login',{
			method:'POST',
			headers:{'Content-Type':'application/json'},
			body:JSON.stringify({username:username.value.trim(),password:password.value})
		});
		const result=await response.json();
		notify(result.message);
		if(response.ok) password.value='';
	}catch(error){
		notify('로컬 서버에 연결할 수 없습니다. server.js를 실행했는지 확인하세요.');
	}finally{
		update();
	}
});

document.querySelector('.facebook')?.addEventListener('click',()=>{
	window.location.href='facebook-demo.html';
});

window.addEventListener('pagehide',()=>{form.reset();});
