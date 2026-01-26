document.addEventListener('DOMContentLoaded', () => {

    // Random Fade-in Animation for Cards
    const fadeInCards = () => {
        const cards = document.querySelectorAll('.bento-card, .traits-row, .ventures-row');

        // Convert NodeList to Array and shuffle randomly
        const cardsArray = Array.from(cards);
        const shuffledCards = cardsArray.sort(() => Math.random() - 0.5);

        // Add initial hidden state
        shuffledCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(60px)'; // Increased from 20px
            card.style.transition = 'opacity 0.3s cubic-bezier(0.215, 0.61, 0.355, 1), transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)'; // Super fast (0.3s)
        });

        // Fade in cards with random order and staggered delay
        shuffledCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 30 + (index * 30)); // Rapid fire stagger: 30ms base + 30ms per card
        });

        // Clean up inline transition after animation to allow CSS hover effects to take over
        const totalAnimationTime = 30 + (shuffledCards.length * 30) + 300;
        setTimeout(() => {
            shuffledCards.forEach(card => {
                card.style.transition = '';
            });
        }, totalAnimationTime);
    };

    // Execute fade-in animation
    fadeInCards();

    // Kinetic Typography for Hero Title
    const heroTitle = document.querySelector('.hero-title');

    if (heroTitle) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

            // Kinetic effect: Weight changes on scroll
            const weight = 400 + (scrollPercent * 500);
            heroTitle.style.fontWeight = weight;

            // Simple parallax for text
            heroTitle.style.transform = `translateY(${scrollPos * 0.15}px)`;
        });
    }

    // Magnetic Button Implementation (Desktop only)
    if (window.innerWidth > 768) {
        const newsletterCard = document.querySelector('.newsletter-card');
        const magneticBtn = document.querySelector('.magnetic-btn');

        if (newsletterCard && magneticBtn) {
            newsletterCard.addEventListener('mousemove', (e) => {
                const cardRect = newsletterCard.getBoundingClientRect();

                const mouseX = e.clientX - cardRect.left;
                const mouseY = e.clientY - cardRect.top;

                const centerX = cardRect.width / 2;
                const centerY = cardRect.height / 2;

                const percentX = (mouseX - centerX) / (cardRect.width / 2);
                const percentY = (mouseY - centerY) / (cardRect.height / 2);

                const maxOffset = 15;

                const moveX = percentX * maxOffset;
                const moveY = percentY * maxOffset;

                magneticBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            newsletterCard.addEventListener('mouseleave', () => {
                magneticBtn.style.transform = `translate(0px, 0px)`;
            });
        }
    }

    // Generic Modal Handler
    const setupModal = (triggerId, modalId) => {
        const trigger = document.getElementById(triggerId);
        const modal = document.getElementById(modalId);
        if (!trigger || !modal) return;

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        const open = (e) => {
            if (e) e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const close = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Stop video if any
            const iframe = modal.querySelector('iframe');
            if (iframe) {
                const src = iframe.src;
                iframe.src = '';
                iframe.src = src;
            }
        };

        trigger.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (overlay) overlay.addEventListener('click', close);

        // Close on Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                close();
            }
        });
    };

    // Setup Modals
    setupModal('open-analyst-modal', 'analyst-modal');
    setupModal('open-resume-modal', 'resume-modal');
    setupModal('open-developer-modal', 'developer-modal');
    setupModal('open-traveler-modal', 'traveler-modal');
    setupModal('open-projects-modal', 'projects-modal');
    setupModal('open-video-modal', 'video-modal');

});
