console.log("JS CONNECTED");

document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const currentYear = document.getElementById("currentYear");

  mobileMenuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });

  currentYear.textContent = new Date().getFullYear();
});
