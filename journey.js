/* Progressive enhancement: without JavaScript, the complete form stays available. */
(() => {
  const form = document.getElementById('requestForm');
  const steps = [...form.querySelectorAll('[data-section]')];
  if (steps.length !== 4) return;
  let current = 0;
  const labels = ['Você', 'Produto', 'Recebimento', 'Pagamento'];
  const nav = document.createElement('nav');
  nav.className = 'journey-nav';
  nav.setAttribute('aria-label', 'Etapas do pedido');
  const status = document.createElement('p');
  status.className = 'journey-status';
  status.setAttribute('aria-live', 'polite');
  const buttons = labels.map((label, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${i + 1}. ${label}`;
    button.addEventListener('click', () => { if (i < current) show(i, true); });
    nav.append(button);
    return button;
  });
  form.before(nav, status);
  const controls = document.createElement('div');
  controls.className = 'journey-controls';
  const back = document.createElement('button');
  back.type = 'button'; back.className = 'button ghost'; back.textContent = '← Voltar';
  const next = document.createElement('button');
  next.type = 'button'; next.className = 'button'; next.textContent = 'Continuar →';
  controls.append(back, next);
  steps.at(-1).after(controls);
  const final = [...form.children].filter(x => !steps.includes(x) && x !== controls);
  function show(index, focus = false) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    buttons.forEach((b, i) => {
      b.disabled = i > index;
      if (i === index) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    final.forEach(x => { x.hidden = index !== 3; });
    back.hidden = index === 0;
    next.hidden = index === 3;
    status.textContent = `Passo ${index + 1} de 4 · ${labels[index]}`;
    if (focus) { const legend = steps[index].querySelector('legend'); legend.tabIndex = -1; legend.focus(); }
  }
  function valid() {
    if (current === 0) {
      const name = form.elements.nome, phone = form.elements.telefone;
      name.setCustomValidity(name.value.trim().split(/\s+/).filter(Boolean).length < 2 ? 'Informe nome e sobrenome.' : '');
      phone.setCustomValidity(/^(\d{10}|\d{11})$/.test(phone.value.replace(/\D/g, '')) ? '' : 'Informe o telefone com DDD.');
    }
    if (current === 1) {
      const price = form.elements.valor;
      const raw = price.value.replace(/R\$/g, '').trim();
      const amount = Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw);
      price.setCustomValidity(Number.isFinite(amount) && amount > 0 && amount <= 1000000 ? '' : 'Informe um valor válido maior que zero.');
    }
    if (current === 2 && form.elements.entrega.value === 'Motoboy') {
      const cep = form.elements.cep;
      cep.setCustomValidity(cep.value.replace(/\D/g, '').length === 8 ? '' : 'Informe um CEP com 8 dígitos.');
    }
    for (const field of steps[current].querySelectorAll('input')) {
      if (!field.disabled && !field.checkValidity()) { field.reportValidity(); return false; }
    }
    return true;
  }
  back.addEventListener('click', () => show(Math.max(0, current - 1), true));
  next.addEventListener('click', () => { if (valid()) show(Math.min(3, current + 1), true); });
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && current < 3) {
      event.preventDefault(); next.click();
    }
  });
  form.addEventListener('invalid', event => {
    const step = event.target.closest('[data-section]');
    if (step && steps.indexOf(step) !== current) show(steps.indexOf(step));
  }, true);
  show(0);
})();
