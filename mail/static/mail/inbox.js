document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Use button to send email
  document.querySelector('#compose-form').addEventListener('submit', () => send_email());

  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-table').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Clear out the emails table.
  if (mailbox === 'inbox') {
    document.querySelector('#emails-body').innerHTML = '';
    display(mailbox);
  }

  if (mailbox === 'archive') {
    document.querySelector('#emails-body').innerHTML = '';
    display(mailbox);
  }

  if (mailbox === 'sent') {
    document.querySelector('#emails-body').innerHTML = '';
    display(mailbox);
  }

}

// Send Email
function send_email() {
  //Prevents a windows specific error from flagging. [WinError 10053].
  event.preventDefault();

  // Contents of email form saved to constants.
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //fetch() POSTs email to view as JSON.
  fetch('emails', {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
  })

  // Load Sent Messages
  load_mailbox('sent')
}

function open_message(email_id) {

  // Constants to represent the email features
  const email_content = document.querySelector('#open-email-view');
  const email_content_sender = document.querySelector('#email-sender');
  const email_content_body = document.querySelector('#email-body');
  const email_content_subject = document.querySelector('#email-subject');

  // Fetch the email. 
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email =>{

    // Display email view, hide other views.
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-table').style.display = 'none';
    document.querySelector('#open-email-view').style.display = 'block';

    // Display email contents.
    email_content_sender.innerHTML = "From: " + email.sender;
    email_content_subject.innerHTML = "Subject: " + email.subject;
    email_content_body.innerHTML = email.body + email.archived;



    // Toggle archive buttons.
    if (email.archived === true) {
      document.querySelector('#Archive').style.visibility = 'hidden';
      document.querySelector('#UnArchive').style.visibility = 'visible';
      document.querySelector('#UnArchive').addEventListener('click', () => unarchive(email_id));
    }
    else if (email.archived === false) {
      document.querySelector('#UnArchive').style.visibility = 'hidden'
      document.querySelector('#Archive').style.visibility = 'visible';
      document.querySelector('#Archive').addEventListener('click', () => archive(email_id));
    }

    document.querySelector('#reply').addEventListener('click', () => reply(email));



    // Update the email property to read.
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }) 
}

function unarchive(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  document.querySelector('#UnArchive').style.visibility = 'hidden';
  document.querySelector('#Archive').style.visibility = 'visible';
  location.reload()
}

function archive(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  document.querySelector('#UnArchive').style.visibility = 'visible';
  document.querySelector('#Archive').style.visibility = 'hidden';
  location.reload()
}

function display(mailbox) {

  // The div containing the inbox.
  const inbox = document.querySelector('#emails-body');
  
  // Show the mailbox and hide other views.
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-table').style.display = 'table';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'none';


  // Show the mailbox name.
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails sent to mailbox.
    fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      
      // Loop through the JSON appending table with content.
      for (let i = 0; i < emails.length; i++) {
        let tr = document.createElement("tr");
        if ((emails[i].read === true) && (mailbox !== 'sent') ) {
          tr.className = "table-secondary";
        }
        tr.innerHTML = "<td>" + emails[i].sender + "</td><td>" + emails[i].subject + "</td><td>" + emails[i].timestamp + "</td>"
        inbox.appendChild(tr);
        tr.addEventListener('click', () => open_message(emails[i].id))
      }
    });
}

function reply(email) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-table').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'none';

  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote "${email.body}"`;

}