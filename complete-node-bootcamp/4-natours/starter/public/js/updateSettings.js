const updateSettings = async (id, name = null, email = null) => {
  console.log({ id, name, email });
  const updateNameEmailObject = {};
  if (name) updateNameEmailObject.name = name;
  if (email) updateNameEmailObject.email = email;

  try {
    const res = await fetch(`http://{{ip}}:8080/api/v1/users/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateNameEmailObject),
    });
    // window.location.assign('/');
    return await res.json();
  } catch (e) {
    console.log(e);
    return e;
  }
};

const saveSettingsBtn = document.getElementById('saveSettings');

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('save settings clicked.');
    console.log(e);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    // window.location.reload();
  });
}
