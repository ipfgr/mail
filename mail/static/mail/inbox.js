document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector("#reply-email").style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#read-email').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector("#compose-form").addEventListener("submit", sendEmail)

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
    const emailsView = document.querySelector('#emails-view')
    // Show the mailbox and hide other views
    emailsView.style.display = 'block';
    document.querySelector('#read-email').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector("#reply-email").style.display = 'none';
    document.querySelector('#folder-now').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Show the mailbox name
    getAllEmails(mailbox)
}

function readEmail(id) {
    const emailsView = document.querySelector('#emails-view')
    const buttonReply = document.querySelector("#reply")
    const buttonArchive = document.querySelector("#archive")
    const buttonUnarchive = document.querySelector("#unarchive")
    document.querySelector("#archive-button").style.display = 'block';
    document.querySelector("#unarchive-button").style.display = 'none';

    // Show the mailbox and hide other views
    emailsView.style.display = 'none';
    document.querySelector("#reply-email").style.display = 'none';
    document.querySelector('#read-email').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    const output = document.querySelector('#output')
    output.innerHTML = ""
    //Fetch new emails
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            document.querySelector('#body').value = email.body
            document.querySelector('#sender').innerHTML = `<h6><strong>From: </strong>${email.sender}</h6>`
            document.querySelector('#subject').innerHTML = `<h6><strong>Subject: </strong>${email.subject}</h6>`
            document.querySelector('#reciver-email').innerHTML = `<h6><strong>To: </strong>You: ${email.recipients} </h6>`
            document.querySelector('#recived-date').innerHTML = `<h6><strong>Recived date: </strong>${email.timestamp}</h6>`
            if (email.archived == false) {
                document.querySelector("#archive-button").style.display = 'block';
                document.querySelector("#unarchive-button").style.display = 'none';
            } else {
                document.querySelector("#archive-button").style.display = 'none';
                document.querySelector("#unarchive-button").style.display = 'block';
            }

        }).then(() => {
        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true,
            })
        })
    }).catch(error => console.log(error));

    //Add or remove Archive button
    buttonArchive.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true,
            })
        }).catch(error => console.log(error));
        location.reload();
    })
    //Add or remove Unrchive button
    buttonUnarchive.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false,
            })
        }).catch(error => console.log(error));
        location.reload();
    })
    //Event when user press reply to email button
    buttonReply.addEventListener('click', () => {
        replyToEmail(id)
    })
}

function replyToEmail(id) {
    document.querySelector("#reply-email").style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#read-email').style.display = 'none';

    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(emailToReply => {
                    document.querySelector('#reply-recipients').value = emailToReply.sender,
                    document.querySelector('#reply-subject').value = `Re: ${emailToReply.subject}`,
                    document.querySelector('#reply-body').value = `
              "On" ${emailToReply.timestamp} , "Sender:" ${emailToReply.sender} "wrote:"
              ${emailToReply.body}
            `
            }
        ).catch(error => console.log(error))

    document.querySelector("#send-reply-button").addEventListener("click", ()=> {
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#reply-recipients').value,
          subject: document.querySelector('#reply-subject').value,
          body: document.querySelector('#reply-body').value,
          archived: false,
        })
      }).finally(() => {
        $('.toast').toast('show');
      }).catch(error => console.log(error))

    })
}

function getAllEmails(mailbox) {
    const output = document.querySelector('#output')
    output.innerHTML = ""

    //Fetch new emails
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            if (emails.length > 0) {
                for (let i = 0; i < emails.length; i++) {
                    if (emails[i].read == true) {
                        let row = `
               <tr id="mail-id" class="read" >
                    
                    
                    <td class="inbox-small-cells"><i class="fa fa-star"></i></td>
                    <td class="view-message">${emails[i].subject}</td>
                    <td class="view-message " onclick = readEmail(${emails[i].id});>${emails[i].body.slice(0, 160)} ...</td>
                    <td class="view-message  inbox-small-cells"><i class="fa fa-paperclip"></i></td>
                    <td class="view-message  text-right">${emails[i].timestamp}</td>
                    <td class="inbox-small-cells">
                        <button type = "button"
                            class="btn btn-outline-danger" id="delete-email"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive" viewBox="0 0 16 16">
                        <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                        </svg>Delete</button>
                    </td>
                    
                </div>
                </tr>
                `
                        output.innerHTML += row
                    } else {
                        let row = `
               <tr id="mail-id" class="unread" onclick = readEmail(${emails[i].id});>
                    <td class="inbox-small-cells">
                        <button type = "button"
                            class="btn btn-outline-danger" id="delete-email"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive" viewBox="0 0 16 16">
                        <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                        </svg>Delete</button>
                    </td>
                    <td class="inbox-small-cells"><i class="fa fa-star"></i></td>
                    <td class="view-message  ">${emails[i].subject}</td>
                    <td class="view-message ">${emails[i].body.slice(0, 160)} ...</td>
                    <td class="view-message  inbox-small-cells"><i class="fa fa-paperclip"></i></td>
                    <td class="view-message  text-right">${emails[i].timestamp}</td>
                </tr>
                `
                        output.innerHTML += row
                    }
                }
            } else {
                output.innerHTML = "<h4>Dont have new emails</h4>"
            }
            $('input[name=checkbox]').change(function() {
                if ($(this).is(':checked')) {
                    console.log("Checkbox is checked..")
                } else {
                    console.log("Checkbox is not checked..")
                }
            });
        });
}

function sendEmail() {
    const message = document.querySelector("#message")
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value,
            archived: false,
        })
    })
        .then(response => response.json())
        .then(result => {
            if (result.message) {
                console.log(result.message)
            } else if (result.error) {
                document.querySelector("#toast-body").innerHTML = `${result.error}`;
                console.log(result.error)
                $('.toast').toast('show');
            }
        }).catch(error => console.log(error));
}

function deleteEmail() {

}

