const firebaseConfig = {
  apiKey: "AIzaSyBDUWq5eqcmup1YazV7gSQTobbJdfSHEMo",
  authDomain: "grota-funda.firebaseapp.com",
  databaseURL: "https://grota-funda-default-rtdb.firebaseio.com",
  projectId: "grota-funda",
  storageBucket: "grota-funda.firebasestorage.app",
  messagingSenderId: "796815371553",
  appId: "1:796815371553:web:edf9923adaa0885e292260"
};

// initialize firebase
firebase.initializeApp(firebaseConfig);

// reference your database
var contactFormDB = firebase.database().ref("contactForm");

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var emailid = getElementVal("emailid");
  var msgContent = getElementVal("msgContent");

  saveMessages(name, emailid, msgContent);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 3000);

  //   reset the form
  document.getElementById("contactForm").reset();
}

const saveMessages = (name, emailid, msgContent) => {
  var newContactForm = contactFormDB.push();

  newContactForm.set({
    name: name,
    emailid: emailid,
    msgContent: msgContent,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};