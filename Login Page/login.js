import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  doc,
  getDoc,
  setDoc,
} from "../Firebase/config.js";

import emailHandler from "../helpers/emailHandler.js";
import passwordHandler from "../helpers/passwordHandler.js";
import showLoading from "../helpers/loader.js";
import handleRedirect from "../handler/handleRedirect.js";
import checkUser from "../utils/checkUser.js";

document.addEventListener("DOMContentLoaded", function () {

  checkUser()

  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("userPassword");
  const currentYear = document.getElementById("currentYear");

  currentYear.textContent = new Date().getFullYear();

  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const icon = this.querySelector("i");
    if (type === "password") {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  });
});

const userLogin = async () => {
  let email = document.getElementById("userEmail");
  let password = document.getElementById("userPassword");

  if (!email.value.trim() || !password.value.trim()) {
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

    email.value = "";
    password.value = "";

    return;
  }

  if (!emailHandler(email.value)) {
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

    email.value = "";
    password.value = "";

    return;
  }

  if (!passwordHandler(password.value)) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Please Enter Password That Contain 8 Characters.",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });

    email.value = "";
    password.value = "";

    return;
  }

  try {
    showLoading();
    const user = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value,
    );
    await handleRedirect(user.user.uid);
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

    email.value = "";
    password.value = "";
  }
};

const googleLogin = async () => {
  try {
    showLoading();

    const res = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", res.user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        email: res.user.email,
        fullName: res.user.displayName || "",
        role: "user",
        isVerified: false,
        createdAt: Date.now(),
      });
    }

    await handleRedirect(res.user.uid);

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


const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const key = e.keyCode || e.which;

  if (key === 13) {
    userLogin();
    return;
  }
  userLogin();
});

const googleBtn = document.getElementById("googleBtn");

googleBtn.addEventListener("click", () => {
  googleLogin();
});
