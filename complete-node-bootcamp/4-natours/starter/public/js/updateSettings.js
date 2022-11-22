const updateSettings = async (data, type) => {
  // type is either data or password
  try {
    const res = await fetch(
      `http://localhost:8080/api/v1/users/${
        type === 'data' ? 'me' : 'updatePassword'
      }`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    // window.location.assign('/');
    return await res.json();
  } catch (e) {
    console.log(e);
    return e;
  }
};

const saveSettingsBtn = document.getElementById('saveSettings');

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const res = await updateSettings({ name, email });
    console.log(res);
    // window.location.reload();
  });
}

const savePasswordBtn = document.getElementById('savePassword');

if (savePasswordBtn) {
  savePasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const res = await updateSettings({ password, newPassword });
    console.log(res);
  });
}
