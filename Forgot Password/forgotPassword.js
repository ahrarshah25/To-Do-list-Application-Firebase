import { auth, sendPasswordResetEmail } from "../Firebase/config.js";
import emailHandler from "../helpers/emailHandler.js";
import showLoading from "../helpers/loader.js";

const sendResetEmail = async () => {
  let userEmail = document.getElementById("userEmail");

  if (!userEmail.value.trim()) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Empty Input.",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });

    userEmail.value = "";

    return;
  }

  if (!emailHandler(userEmail.value)) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title:
        "Pleasde Enter Correct Email WIth Correct Syntax.\nFor Example: name@domain.com",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });

    userEmail.value = "";

    return;
  }

  try {
    showLoading()
    await sendPasswordResetEmail(auth, userEmail.value);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Password Reset Email Send To " + userEmail.value,
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    }).then(() => {window.location.href = "/login"})
  } catch (error) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: error.message,
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });
  }
};

const sendBtn = document.getElementById("sendBtn")

sendBtn.addEventListener('click' , (e) => {
    e.preventDefault();

    const key = e.keyCode || e.which;

    if(key === 13) {
        sendResetEmail();
        return;
    }

    sendResetEmail();
})