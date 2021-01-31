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
    emailsView.style.display= 'none';
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
            document.querySelector('#reciver-email').innerHTML = `<h6><strong>To: </strong>You (${email.recipient})</h6>`
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
        })
        location.reload();
    })
    //Add or remove Unrchive button
    buttonUnarchive.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false,
            })

        })
        location.reload();
    })

    //Event when user press reply to email button
    buttonReply.addEventListener('click', ()=>{
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


        })

}

function getAllEmails(mailbox) {
    const output = document.querySelector('#output')
    const emailsView = document.querySelector('#emails-view')
    output.innerHTML = ""

    //Fetch new emails
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            if (emails.length > 0) {
                for (let i = 0; i < emails.length; i++) {
                    if (emails[i].read == true){
                      let row = `
               <tr id="mail-id" class="read" onclick = readEmail(${emails[i].id});>
                    <td class="inbox-small-cells" >
                        <input type="checkbox" class="mail-checkbox">
                    </td>
                    <td class="inbox-small-cells"><i class="fa fa-star"></i></td>
                    <td class="view-message  dont-show">${emails[i].subject}</td>
                    <td class="view-message ">${emails[i].body.slice(0, 160)} ...</td>
                    <td class="view-message  inbox-small-cells"><i class="fa fa-paperclip"></i></td>
                    <td class="view-message  text-right">${emails[i].timestamp}</td>
                </tr>
                `
                      output.innerHTML += row
                    }
                    else {
                      let row = `
               <tr id="mail-id" class="unread" onclick = readEmail(${emails[i].id});>
                    <td class="inbox-small-cells" >
                        <input type="checkbox" class="mail-checkbox">
                    </td>
                    <td class="inbox-small-cells"><i class="fa fa-star"></i></td>
                    <td class="view-message  dont-show">${emails[i].subject}</td>
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
    }).then(()=> {
      $('.toast').toast('show');
    })
        .then(response => response.json())
        .then(result => {
            if (result.message) {
                console.log(result.message)
            } else if (result.error) {
                let para = document.createElement("P");
                para.innerHTML = `<h1>${result.error}</h1>`
                document.getElementById("message").appendChild(para);
                console.log(result.error)

            }
        })

}


function deleteEmail() {

}

