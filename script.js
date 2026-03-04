document.addEventListener('DOMContentLoaded', () => {
    // Interactive Navbar on Scroll
    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 1. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // 2. Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });

    // 3. Form Handling with N8N Webhook Simulation
    // In a production environment, you will replace these URLs with the mapped N8N Webhooks
    const N8N_WEBHOOK_URL_TEST = 'https://n8n.your-bayer-domain.com/webhook/post-test-access';
    const N8N_WEBHOOK_URL_PROD = 'https://n8n.your-bayer-domain.com/webhook/post-prod-access';

    const testForm = document.getElementById('test-form');
    const prodForm = document.getElementById('prod-form');

    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="ph ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Trigger reflow to start animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    };

    const submitFormToN8N = async (e, url, typeText) => {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;

        // Form Data gathering
        const inputs = form.querySelectorAll('input, textarea, select');
        const data = {};

        inputs.forEach(input => {
            if (input.id) {
                // Extract part after dash, e.g. test-name -> name
                const key = input.id.split('-')[1];
                if (key) {
                    data[key] = input.value;
                }
            }
        });

        // Add additional context
        data.requestType = typeText;
        data.timestamp = new Date().toISOString();

        try {
            // Update UI State
            btn.disabled = true;
            btn.innerHTML = `<span>Enviando para o ${typeText === 'Testes' ? 'N8N' : 'Zendesk'}...</span><i class="ph ph-spinner ph-spin"></i>`;

            // IMPORTANT:
            // Since there is no true configured N8N webhook, we simulate a network delay.
            // When N8N is ready, UNCOMMENT the block below over the simulated wait.

            /*
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Falha ao enviar solicitação para o N8N');
            */

            // SIMULATED N8N CALL (Using a timeout for UX purposes)
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('--- MOCK PAYLOAD ENVIADO PARA N8N [' + url + '] ---');
            console.log(JSON.stringify(data, null, 2));
            console.log('-------------------------------------------');

            if (typeText === 'Testes') {
                showToast(`Sucesso! Os dados sandbox serão criados no N8N. Verifique seu e-mail em breve.`);
            } else {
                showToast(`Ticket no Zendesk criado com sucesso! Acompanhe a solicitação no seu e-mail.`);
            }
            form.reset();
        } catch (error) {
            console.error('Erro na integração:', error);
            showToast(`Erro ao processar a solicitação. Tente novamente ou contate o suporte.`, 'error');
        } finally {
            // Reset UI
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
        }
    };

    if (testForm) {
        testForm.addEventListener('submit', (e) => submitFormToN8N(e, N8N_WEBHOOK_URL_TEST, 'Testes'));
    }

    if (prodForm) {
        prodForm.addEventListener('submit', (e) => submitFormToN8N(e, N8N_WEBHOOK_URL_PROD, 'Produção'));
    }
});
