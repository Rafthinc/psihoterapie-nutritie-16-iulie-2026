document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. SKELETON LOADER (Doherty Threshold & Perceived Performance)
    // ==========================================================================
    const loader = document.getElementById("skeleton-loader");
    const minLoadTime = 380; // Minimal loading display in ms to prevent jarring flashes
    const startTime = Date.now();

    window.addEventListener("load", () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);

        setTimeout(() => {
            loader.classList.add("fade-out");
            document.body.style.overflowY = "auto";
        }, remainingTime);
    });

    // Fallback if load event doesn't fire fast
    setTimeout(() => {
        if (!loader.classList.contains("fade-out")) {
            loader.classList.add("fade-out");
        }
    }, 1500);


    // ==========================================================================
    // 2. MOBILE NAVIGATION MENU
    // ==========================================================================
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    const toggleMenu = () => {
        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
        
        // Prevent body scrolling when mobile menu is active
        if (navMenu.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    };

    menuToggle.addEventListener("click", toggleMenu);

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("active")) {
                toggleMenu();
            }
        });
    });


    // ==========================================================================
    // 3. SMOOTH NAVIGATION SCROLL & ACTIVE LINK HIGHLIGHTING
    // ==========================================================================
    const sections = document.querySelectorAll("section");
    
    const highlightNav = () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // offset header
            const sectionId = current.getAttribute("id");
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add("active");
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove("active");
            }
        });
    };

    window.addEventListener("scroll", highlightNav);


    // ==========================================================================
    // 4. FORM VALIDATION & SUBMISSION (Postel's Law & Human Error Handling)
    // ==========================================================================
    const form = document.getElementById("appointment-form");
    const successMsg = document.getElementById("form-success-message");
    const errorMsg = document.getElementById("form-error-message");
    const retryBtn = document.getElementById("form-retry-btn");
    
    // ==========================================================================
    // Web3Forms Configuration
    // ==========================================================================
    const WEB3FORMS_ACCESS_KEY = "554da5e4-e083-4f1f-9fcf-1bbed2029070";

    // Inputs
    const nameInput = document.getElementById("form-name");
    const emailInput = document.getElementById("form-email");
    const phoneInput = document.getElementById("form-phone");
    const serviceSelect = document.getElementById("form-service");
    const messageInput = document.getElementById("form-message");

    // Validation utilities
    const isEmailValid = (email) => {
        // Liberal email check (Postel's law)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateField = (input, errorSpan) => {
        let isValid = true;

        if (input.required && !input.value.trim()) {
            isValid = false;
        } else if (input.type === "email" && input.value.trim() && !isEmailValid(input.value)) {
            isValid = false;
        }

        if (!isValid) {
            input.classList.add("invalid");
            errorSpan.style.display = "block";
        } else {
            input.classList.remove("invalid");
            errorSpan.style.display = "none";
        }

        return isValid;
    };

    // Real-time feedback after first submit attempt
    let attemptedSubmit = false;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        attemptedSubmit = true;

        // Validate all fields
        const isNameOk = validateField(nameInput, document.getElementById("error-name"));
        const isEmailOk = validateField(emailInput, document.getElementById("error-email"));
        const isMessageOk = validateField(messageInput, document.getElementById("error-message"));

        if (isNameOk && isEmailOk && isMessageOk) {
            const submitBtn = document.getElementById("form-submit-btn");
            const originalBtnText = submitBtn.innerText;
            
            submitBtn.disabled = true;
            submitBtn.innerText = "Se trimite...";
            submitBtn.style.opacity = "0.7";

            // Map service names for cleaner emails
            const serviceNames = {
                "integ": "Abordare Integrată (Psihoterapie + Nutriție)",
                "psych": "Doar Psihoterapie CBT",
                "nutri": "Doar Nutriție Clinică"
            };
            const selectedServiceLabel = serviceNames[serviceSelect.value] || serviceSelect.value;
            
            // Send via Web3Forms API
            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    subject: `Solicitare Nouă Cabinet - ${nameInput.value}`,
                    from_name: "Adrian Francois Roșu Website",
                    name: nameInput.value,
                    email: emailInput.value,
                    phone: phoneInput.value || "Nespecificat",
                    service: selectedServiceLabel,
                    message: messageInput.value
                })
            })
            .then(async (response) => {
                const json = await response.json();
                if (response.status === 200 && json.success) {
                    form.style.opacity = "0";
                    setTimeout(() => {
                        form.classList.add("hidden");
                        successMsg.classList.remove("hidden");
                    }, 250);
                } else {
                    throw new Error(json.message || "A apărut o problemă la trimitere.");
                }
            })
            .catch((error) => {
                console.error("Web3Forms Error:", error);
                form.style.opacity = "0";
                setTimeout(() => {
                    form.classList.add("hidden");
                    errorMsg.classList.remove("hidden");
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                    submitBtn.style.opacity = "1";
                }, 250);
            });
        }
    });

    // Retry button click (resets and shows form again)
    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            errorMsg.classList.add("hidden");
            form.classList.remove("hidden");
            form.style.opacity = "1";
            attemptedSubmit = false;
            form.reset();
        });
    }

    // Dynamically clear errors on typing
    const addLiveValidation = (input, errorSpan) => {
        input.addEventListener("input", () => {
            if (attemptedSubmit) {
                validateField(input, errorSpan);
            }
        });
    };

    addLiveValidation(nameInput, document.getElementById("error-name"));
    addLiveValidation(emailInput, document.getElementById("error-email"));
    addLiveValidation(messageInput, document.getElementById("error-message"));


    // ==========================================================================
    // 5. INTERACTIVE SMARTPHONE MOCKUP ACTION (Delight & Engagement)
    // ==========================================================================
    const mockAppBtn = document.querySelector(".mock-app-btn");
    const logAlertText = document.querySelector(".log-alert p");
    
    const cbtMessages = [
        "Jurnal CBT: Nivelul de anxietate a scăzut cu 40% în urma exercițiului de respirație.",
        "Recomandare CBT: Identifică 3 lucruri pozitive din ziua de azi pentru a combate filtrarea mentală negativă.",
        "Jurnal Nutriție: Ritmul meselor s-a stabilizat. Relația cu alimentația se îmbunătățește.",
        "Asistent Panică: Concentrează-te pe respirația 4-7-8. Corpul tău este în siguranță acum."
    ];

    let messageIndex = 0;

    mockAppBtn.addEventListener("click", () => {
        // Quick visual transition (Doherty Threshold)
        logAlertText.style.opacity = "0";
        
        setTimeout(() => {
            messageIndex = (messageIndex + 1) % cbtMessages.length;
            logAlertText.innerText = cbtMessages[messageIndex];
            logAlertText.style.opacity = "1";
        }, 150);
    });

});
