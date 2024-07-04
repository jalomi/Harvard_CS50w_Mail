document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#compose-form').addEventListener('submit', event => {
    event.preventDefault();
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
  })
  .catch(error => {
    console.log(`ERROR: ${error}`)
  });
}

function list_email(email, mailbox) {
  const div = document.createElement('div');
  div.className = 'email';
  div.innerHTML = `<b>${email.sender}</b> ${email.subject}  <div style='float: right'>${email.timestamp}<div>`;
  back_color = email.read ? "lightgrey" : "white";
  div.style.cssText = `background: ${back_color}`;
  div.addEventListener('click', () => open_email(email, mailbox));
  document.querySelector('#emails-view').append(div);
}

function open_email(email, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Mark as read
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true,
        })
      })

      // Populate divs with data
      document.querySelector('#email-view').innerHTML = `
      <div>
        <b>From:</b> ${email.sender}
      </div>
      <div>
        <b>To:</b> ${email.recipients}
      <div>
        <b>Subject:</b> ${email.subject}
      </div>
      <div>
        <b>At:</b> ${email.timestamp}
      </div>
      <div>
        <button class="btn btn-sm btn-outline-primary" id="email-archive">Archive</button>
        <button class="btn btn-sm btn-outline-primary" id="email-unarchive">Unarchive</button>
      </div>
      <hr>
      <div>
        ${email.body}
      </div>
      `

      switch (mailbox) {
        case 'inbox':
          document.querySelector('#email-unarchive').style.display = 'none';
          document.querySelector('#email-archive').addEventListener('click', () => archive_email(email, true));
          break;
        case 'archive':
          document.querySelector('#email-archive').style.display = 'none';
          document.querySelector('#email-unarchive').addEventListener('click', () => archive_email(email, false));
          break;
      
        default:
          document.querySelector('#email-archive').style.display = 'none';
          document.querySelector('#email-unarchive').style.display = 'none';
          break;
      }
  });
}

function archive_email(email, value) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: value,
    })
  })
  .then(() => {
    load_mailbox('inbox');
  });  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //console.log(emails);
    emails.forEach(email => {
      list_email(email, mailbox);
    });
  })
}