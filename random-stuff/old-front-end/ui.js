// navbar burger
document.addEventListener("DOMContentLoaded", () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0,
  );

  // Add a click event on each of them
  $navbarBurgers.forEach((el) => {
    el.addEventListener("click", () => {
      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle("is-active");
      $target.classList.toggle("is-active");
    });
  });
});

// get dom elements
const html = document.querySelector("html");
const toggle = document.getElementById("theme-toggle"); // toggle button
const themeIcon = document.getElementById("theme-icon"); // icon

// create light and dark icons
const lightIconElement = document.createElement("i");
lightIconElement.classList.add("fas", "fa-sun");
lightIconElement.id = "light-icon";

const darkElementIcon = document.createElement("i");
darkElementIcon.classList.add("fas", "fa-moon");
darkElementIcon.id = "dark-icon";

// change theme on click
toggle.addEventListener("click", () => {
  if (html.classList.contains("theme-dark")) {
    // change to light
    console.log("dark->light");

    // change html attribute to force theme
    html.classList.remove("theme-dark");
    html.classList.add("theme-light");
    // change icon
    themeIcon.classList.remove("has-text-link");
    themeIcon.classList.add("has-text-warning");
    let getThemeIcon = document.getElementById("dark-icon");
    themeIcon.replaceChild(lightIconElement, getThemeIcon);
  } else if (html.classList.contains("theme-light")) {
    // change to dark
    console.log("light->dark");

    // change html attribute to force theme
    html.classList.remove("theme-light");
    html.classList.add("theme-dark");
    // change icon
    themeIcon.classList.remove("has-text-warning");
    themeIcon.classList.add("has-text-link");
    let getThemeIcon = document.getElementById("light-icon");
    themeIcon.replaceChild(darkElementIcon, getThemeIcon);
  }
});
