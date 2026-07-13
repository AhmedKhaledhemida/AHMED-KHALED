document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const headerContainer = document.querySelector(".banner-header");

  if (toggleBtn && headerContainer) {
    const hamburgerIcon = toggleBtn.querySelector(".icon-hamburger");
    const closeIcon = toggleBtn.querySelector(".icon-close");

    toggleBtn.addEventListener("click", () => {
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", !isExpanded);
      headerContainer.classList.toggle("drawer-open");

      if (isExpanded) {
        hamburgerIcon.style.display = "block";
        closeIcon.style.display = "none";
      } else {
        hamburgerIcon.style.display = "none";
        closeIcon.style.display = "block";
      }
    });
  }

  const animatedButtons = document.querySelectorAll(".animated-btn");
  animatedButtons.forEach(button => {
    const arrow = button.querySelector(".arrow-icon");
    button.addEventListener("mouseenter", () => {
      if (arrow) arrow.style.transform = "translateX(5px)";
    });
    button.addEventListener("mouseleave", () => {
      if (arrow) arrow.style.transform = "translateX(0)";
    });
  });
});
