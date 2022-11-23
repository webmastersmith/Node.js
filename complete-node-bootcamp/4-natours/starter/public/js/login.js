const login = async (email, password) => {
  try {
    const res = await fetch('http://172.22.115.74:8080/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    window.location.assign('/');
    return await res.json();
  } catch (e) {
    console.log(e);
    return e;
  }
};
document.querySelector('.form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const data = await login(email, password);
  console.log(data);
});
