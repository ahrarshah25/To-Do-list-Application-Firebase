import { auth, getDoc, db, doc } from "../Firebase/config";

document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const currentYear = document.getElementById("currentYear");
  const loginNav = document.getElementById("loginNav");
  const signupNav = document.getElementById("signupNav");

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        return;
      }

      const data = snap.data();

      if(data.role === "admin") {
        loginNav.href = "/admin";
        loginNav.textContent = "Admin Panel";
        signupNav.style.display = "none";
      } else {
        loginNav.href = "/dashboard";
        loginNav.textContent = "Dashboard";
        signupNav.style.display = "none";
      }
    }
  });

  mobileMenuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });

  currentYear.textContent = new Date().getFullYear();
});
