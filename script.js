/* jrr.petciclo.cl — terminal interactivo de contacto (Julio CLI) */

(function () {
  const output = document.getElementById('terminal-output');
  const controls = document.getElementById('terminal-controls');

  const PROMPT = 'julio@asistente:~$';
  const TYPING_SPEED = 28; // ms por carácter

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function createLine(html, className = '') {
    const p = document.createElement('p');
    if (className) p.className = className;
    p.innerHTML = html;
    output.appendChild(p);
    p.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return p;
  }

  async function typeText(html, withPrompt = true) {
    const p = document.createElement('p');
    output.appendChild(p);
    p.scrollIntoView({ behavior: 'smooth', block: 'end' });

    if (withPrompt) {
      const prompt = document.createElement('span');
      prompt.className = 'prompt';
      prompt.textContent = PROMPT + ' ';
      p.appendChild(prompt);
    }

    const span = document.createElement('span');
    p.appendChild(span);

    // Escribir carácter por carácter (simple, respetando HTML plano)
    const text = html;
    for (let i = 0; i < text.length; i++) {
      span.textContent += text[i];
      await sleep(TYPING_SPEED);
    }
  }

  async function runIntro() {
    await typeText('iniciar_contacto.sh');
    await sleep(300);

    createLine('Hola. Soy <strong>Julio</strong>, el asistente de Javier.');
    await sleep(500);
    createLine('Te dejo sus datos de contacto:');
    await sleep(300);

    createLine('email: <a href="mailto:javier@petciclo.cl">javier@petciclo.cl</a>');
    createLine('whatsapp: <a href="https://wa.me/56963402024">+56 9 6340 2024</a>');
    createLine('github: <a href="https://github.com/jrrpet">github.com/jrrpet</a>');
    createLine('empresa: <a href="https://petciclo.cl">petciclo.cl</a>');
    createLine('ubicación: Santiago de Chile');
    await sleep(400);

    await typeText('¿Quieres escribirle? (s/n)');
    showChoices();
  }

  function showChoices() {
    controls.innerHTML = '';

    const wrapper = document.createElement('p');
    wrapper.className = 'terminal-line';

    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'terminal-choice';
    yes.textContent = '[ s ] escribir';
    yes.onclick = showForm;

    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'terminal-choice';
    no.textContent = '[ n ] solo ver';
    no.onclick = () => {
      controls.innerHTML = '';
      typeText('ok, gracias por visitar jrr.petciclo.cl');
    };

    wrapper.appendChild(yes);
    wrapper.appendChild(document.createTextNode('  '));
    wrapper.appendChild(no);
    controls.appendChild(wrapper);
  }

  function showForm() {
    controls.innerHTML = '';

    const form = document.createElement('form');
    form.className = 'terminal-form';
    form.onsubmit = handleSubmit;

    form.innerHTML = `
      <label>tu_nombre: <input type="text" id="t-name" required autocomplete="name"></label>
      <label>tu_email:  <input type="email" id="t-email" required autocomplete="email"></label>
      <label>mensaje:   <textarea id="t-message" rows="3" required></textarea></label>
      <button type="submit" class="terminal-choice">[ enviar ]</button>
    `;

    controls.appendChild(form);
    form.querySelector('#t-name').focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('t-name').value.trim();
    const email = document.getElementById('t-email').value.trim();
    const message = document.getElementById('t-message').value.trim();

    const subject = 'Contacto desde jrr.petciclo.cl';
    const body = [
      'Nombre: ' + name,
      'Email: ' + email,
      '',
      'Mensaje:',
      message
    ].join('\n');

    const mailto = 'mailto:javier@petciclo.cl?subject=' +
      encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    controls.innerHTML = '';
    typeText('abriendo cliente de correo...');
    window.location.href = mailto;
  }

  if (output && controls) {
    runIntro();
  }
})();
