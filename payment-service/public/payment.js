// -------------------- Input Formatters --------------------

document.getElementById('card-number').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
  
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
  
    e.target.value = formattedValue;
  });
  
  document.getElementById('card-expiry').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    e.target.value = value;
  });
  
  // -------------------- Progress Steps Logic --------------------
  
  const steps = document.querySelectorAll('.step');
  function updateSteps(step) {
    steps.forEach((s, i) => {
      s.classList.remove('active', 'completed');
      if (i < step) s.classList.add('completed');
      else if (i === step) s.classList.add('active');
    });
  }
  
  // -------------------- Input Validation --------------------
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const amountInput = document.getElementById('amount');
  const cardNumberInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvcInput = document.getElementById('card-cvc');
  
  function checkInputs() {
    if (
      nameInput.value &&
      emailInput.value &&
      amountInput.value &&
      cardNumberInput.value &&
      cardExpiryInput.value &&
      cardCvcInput.value
    ) {
      updateSteps(1);
    } else {
      updateSteps(0);
    }
  }
  
  [nameInput, emailInput, amountInput, cardNumberInput, cardExpiryInput, cardCvcInput].forEach(input =>
    input.addEventListener('input', checkInputs)
  );
  
  // -------------------- Card Validation --------------------
  
  function validateCardNumber(number) {
    number = number.replace(/\D/g, '');
    if (!/^\d{13,19}$/.test(number)) return false;
  
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }
  
  cardNumberInput.addEventListener('blur', function () {
    const cardNumber = this.value.replace(/\s+/g, '');
    document.getElementById('card-errors').textContent = validateCardNumber(cardNumber)
      ? ''
      : 'Invalid card number';
  });
  
  // -------------------- Show Feedback Message --------------------
  
  function showMessage(messageText, type) {
    const paymentMessage = document.getElementById('payment-message');
    paymentMessage.innerHTML = '';
    paymentMessage.className = `message-container ${type}`;
  
    const icon = document.createElement('span');
    icon.innerHTML =
      type === 'success'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  
    const messageContent = document.createElement('span');
    messageContent.textContent = messageText;
  
    paymentMessage.appendChild(icon);
    paymentMessage.appendChild(messageContent);
    paymentMessage.classList.remove('hidden');
  
    if (type === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  // -------------------- Form Submit Handler --------------------
  
  const form = document.getElementById('payment-form');
  const submitButton = document.getElementById('submit-button');
  const spinner = document.getElementById('spinner');
  const buttonText = document.getElementById('button-text');
  
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
  
    submitButton.disabled = true;
    spinner.classList.remove('hidden');
    buttonText.textContent = 'Processing...';
  
    const name = nameInput.value;
    const email = emailInput.value;
    const amount = amountInput.value;
    const cardNumber = cardNumberInput.value.replace(/\s+/g, '');
    const cardExpiry = cardExpiryInput.value;
    const cardCvc = cardCvcInput.value;
  
    try {
      // Create payment intent on server
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod: 'card',
          client: { name, email }
        })
      });
  
      if (!response.ok) throw new Error('Payment intent creation failed');
  
      const data = await response.json();
  
      // Confirm the payment
      const stripe = Stripe(window.publishableKey); // Set in fetchConfig
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            number: cardNumber,
            exp_month: parseInt(cardExpiry.split('/')[0]),
            exp_year: parseInt('20' + cardExpiry.split('/')[1]),
            cvc: cardCvc
          },
          billing_details: { name, email }
        }
      });
  
      if (result.error) {
        showMessage(result.error.message, 'error');
        updateSteps(0);
      } else {
        updateSteps(2);
        showMessage('Payment successful! Thank you for your purchase.', 'success');
        form.reset();
      }
    } catch (err) {
      showMessage(err.message || 'An error occurred. Please try again.', 'error');
      updateSteps(0);
    } finally {
      submitButton.disabled = false;
      spinner.classList.add('hidden');
      buttonText.textContent = 'Complete Payment';
    }
  });
  
  // -------------------- Fetch Stripe Config --------------------
  
  async function fetchConfig() {
    try {
      const res = await fetch('/api/payments/config');
      const data = await res.json();
  
      if (!data.publishableKey) {
        throw new Error('Publishable key not found');
      }
  
      window.publishableKey = data.publishableKey;
      console.log('✅ Stripe Key:', window.publishableKey);
    } catch (error) {
      console.error('❌ Stripe config error:', error);
      showMessage('Stripe config failed to load.', 'error');
    }
  }
  
  fetchConfig();
  