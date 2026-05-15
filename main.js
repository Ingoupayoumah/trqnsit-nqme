// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize intl-tel-input
    const phoneOptions = {
        preferredCountries: ['cm', 'ci', 'sn'],
        onlyCountries: ['cm', 'ga', 'cg', 'cd', 'td', 'cf', 'gq', 'ci', 'sn', 'ml', 'bf', 'ne', 'tg', 'bj', 'gn'],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    };

    const payPhoneInput = document.querySelector("#pay-phone");
    const quotePhoneInput = document.querySelector("#phone");
    
    let itiPay, itiQuote;
    if (payPhoneInput) itiPay = window.intlTelInput(payPhoneInput, phoneOptions);
    if (quotePhoneInput) itiQuote = window.intlTelInput(quotePhoneInput, phoneOptions);

    // Operator Logo Logic (Orange / MTN)
    const orangeLogo = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg";
    const mtnLogo = "https://upload.wikimedia.org/wikipedia/commons/a/a5/MTN_Logo.svg";

    function updateOperatorLogo(inputElement, logoElement, itiInstance) {
        if (!inputElement || !logoElement || !itiInstance) return;
        
        inputElement.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '');
            const countryData = itiInstance.getSelectedCountryData();
            
            if (countryData.iso2 === 'cm') {
                if (/^(69|655|656|657|658|659)/.test(val)) {
                    logoElement.src = orangeLogo;
                    logoElement.style.display = 'block';
                } else if (/^(67|650|651|652|653|654|68)/.test(val)) {
                    logoElement.src = mtnLogo;
                    logoElement.style.display = 'block';
                } else {
                    logoElement.style.display = 'none';
                }
            } else {
                logoElement.style.display = 'none';
            }
        });
        
        inputElement.addEventListener('countrychange', function() {
            logoElement.style.display = 'none';
        });
    }

    const payLogo = document.getElementById('pay-operator-logo');
    const quoteLogo = document.getElementById('quote-operator-logo');
    
    updateOperatorLogo(payPhoneInput, payLogo, itiPay);
    updateOperatorLogo(quotePhoneInput, quoteLogo, itiQuote);

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); // Close mobile menu if open

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Gestion de la soumission du formulaire de Devis via Web3Forms
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('.submit-btn');
            const originalText = btn.innerHTML;
            
            // État de chargement
            btn.innerHTML = `<i data-lucide="loader"></i> Envoi en cours...`;
            btn.style.opacity = '0.7';
            btn.disabled = true;
            if (window.lucide) window.lucide.createIcons();

            // Préparation des données
            const formData = new FormData(this);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // Envoi silencieux via Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200) {
                    // Succès
                    btn.innerHTML = `<i data-lucide="check-circle"></i> Devis envoyé avec succès !`;
                    btn.style.background = 'var(--secondary)';
                    btn.style.opacity = '1';
                    quoteForm.reset();
                } else {
                    // Erreur API
                    console.log(response);
                    btn.innerHTML = `<i data-lucide="alert-circle"></i> Erreur lors de l'envoi`;
                    btn.style.background = '#ef4444';
                    btn.style.opacity = '1';
                }
            })
            .catch(error => {
                // Erreur réseau
                console.log(error);
                btn.innerHTML = `<i data-lucide="alert-circle"></i> Erreur réseau`;
                btn.style.background = '#ef4444';
                btn.style.opacity = '1';
            })
            .finally(() => {
                if (window.lucide) window.lucide.createIcons();
                // Rétablir le bouton après 4 secondes
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    if (window.lucide) window.lucide.createIcons();
                }, 4000);
            });
        });
    }

    // Gestion du paiement via Flutterwave
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('pay-name').value;
            const email = document.getElementById('pay-email').value;
            const phone = itiPay ? itiPay.getNumber() : document.getElementById('pay-phone').value;
            const amount = document.getElementById('pay-amount').value;
            const ref = document.getElementById('pay-ref').value;
            
            // Génération d'une référence de transaction unique
            const tx_ref = "SINC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

            // Vérifier que FlutterwaveCheckout est bien chargé
            if (typeof FlutterwaveCheckout !== 'function') {
                alert("Erreur de chargement du module de paiement. Veuillez réessayer.");
                return;
            }

            // Appel de l'API Flutterwave
            FlutterwaveCheckout({
                public_key: "FLWPUBK_TEST-SANDBOXDEMOKEY-X", // REMARQUE: Ceci est une clé de test par défaut. Pour que le paiement marche réellement, tu DOIS créer un compte Flutterwave.
                tx_ref: tx_ref,
                amount: amount,
                currency: "XAF", // Devise FCFA
                payment_options: "mobilemoneyfranco, card", // Permet Mobile Money zone CFA et Cartes
                meta: {
                    invoice_ref: ref,
                },
                customer: {
                    email: email,
                    phone_number: phone,
                    name: name,
                },
                customizations: {
                    title: "SinoCam Logistics",
                    description: "Paiement de facture : " + ref,
                    logo: "https://cdn-icons-png.flaticon.com/512/3256/3256930.png", // Logo professionnel de logistique
                },
                callback: function (data) {
                    console.log("Paiement status :", data);
                    if (data.status === "successful") {
                        alert("Succès ! Votre paiement a été traité.");
                        paymentForm.reset();
                    }
                },
                onclose: function() {
                    // Code à exécuter si l'utilisateur ferme la fenêtre sans payer
                }
            });
        });
    }
});
