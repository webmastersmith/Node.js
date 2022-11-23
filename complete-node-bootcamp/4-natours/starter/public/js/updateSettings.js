const updateSettings = async (data, type) => {
  // type is either data or password
  console.log('updateSettings data', data);
  try {
    const res = await fetch(
      `http://172.22.115.74:8080/api/v1/users/${
        type === 'data' ? 'me' : 'updatePassword'
      }`,
      {
        method: 'PATCH',
        headers: {
          // 'Content-Type': 'multipart/form-data',
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
    // because multer expects multipart form data.
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    const res = await updateSettings(form, 'data');
    console.log('Save Settings Results', res);
    // window.location.reload();
  });
}

const savePasswordBtn = document.getElementById('savePassword');

if (savePasswordBtn) {
  savePasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const res = await updateSettings({ password, newPassword }, 'password');
    console.log(res);
  });
}
