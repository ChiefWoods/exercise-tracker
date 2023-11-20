const addForm = document.querySelector('#add-exercise')

addForm.addEventListener('submit', e => {
  const id = e.target.querySelector('input[name="id"]').value;

  addForm.action = `api/users/${id}/exercises`;
  addForm.method = 'POST';
  addForm.submit();
})

const retrieveForm = document.querySelector('#retrieve-exercise')

retrieveForm.addEventListener('submit', e => {
  const id = e.target.querySelector('input[name="id"]').value;
  const from = e.target.querySelector('input[name="from"]').value;
  const to = e.target.querySelector('input[name="to"]').value;
  const limit = e.target.querySelector('input[name="limit"]').value;

  retrieveForm.action = `api/users/${id}/logs?from=${from}?to=${to}?limit=${limit}`;
  retrieveForm.method = 'GET';
  retrieveForm.submit();
})
