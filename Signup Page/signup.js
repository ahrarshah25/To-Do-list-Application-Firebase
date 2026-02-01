import {
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  doc,
  setDoc,
} from "../Firebase/config.js";

import emailHandler from "../helpers/emailHandler.js";
import passwordHandler from "../helpers/passwordHandler.js";
import showLoading from "../helpers/loader.js";
import checkUser from "../utils/checkUser.js";


document.addEventListener("DOMContentLoaded", function () {

  checkUser();

  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword",
  );
  const passwordInput = document.getElementById("userPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
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

  toggleConfirmPassword.addEventListener("click", function () {
    const type =
      confirmPasswordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordInput.setAttribute("type", type);

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

const signupUser = async () => {
  let userName = document.getElementById("fullName");
  let userEmail = document.getElementById("userEmail");
  let userPassword = document.getElementById("userPassword");
  let confirmPassword = document.getElementById("confirmPassword");

  if (
    !userName.value.trim() ||
    !userEmail.value.trim() ||
    !userPassword.value.trim() ||
    !confirmPassword.value.trim()
  ) {
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
    userName.value = "";
    userPassword.value = "";
    confirmPassword.value = "";

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
    userName.value = "";
    userPassword.value = "";
    confirmPassword.value = "";

    return;
  }

  if (!passwordHandler(userPassword.value)) {
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

    userEmail.value = "";
    userName.value = "";
    userPassword.value = "";
    confirmPassword.value = "";

    return;
  }

  if (userPassword.value !== confirmPassword.value) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Please Enter Same Password In Confirm Password Section.",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });

    userEmail.value = "";
    userName.value = "";
    userPassword.value = "";
    confirmPassword.value = "";

    return;
  }

  try {
    showLoading();

    const res = await createUserWithEmailAndPassword(
      auth,
      userEmail.value,
      userPassword.value,
    );

    await setDoc(doc(db, "users", res.user.uid), {
      email: userEmail.value,
      fullName: userName.value,
      role: "user",
      isVerified: false,
      createdAt: Date.now(),
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Account Created \n Wait For Admin Approval.",
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

    userEmail.value = "";
    userName.value = "";
    userPassword.value = "";
    confirmPassword.value = "";
  }
};

import { getDoc } from "../Firebase/config.js";

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

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Account Created \n Wait For Admin Approval.",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    }).then(() => {
      window.location.href = "/login";
    });

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


const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const key = e.keyCode || e.which;

  if (key === 13) {
    signupUser();
    return;
  }

  signupUser();
});

const googleBtn = document.getElementById("googleBtn");

googleBtn.addEventListener("click", () => {
  googleLogin();
});