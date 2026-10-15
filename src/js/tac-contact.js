import '../scss/tac-contact.scss';
import { contactEmail, contactLinks } from '../data/tac-contact.js';

document.querySelectorAll('[data-contact-email]').forEach((link) => {
  link.textContent = contactEmail;
  link.href = contactLinks.sales;
});
document.querySelector('#copyEmail').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(contactEmail);
    document.querySelector('#copyStatus').textContent = 'Email address copied.';
  } catch {
    document.querySelector('#copyStatus').textContent = 'Please select and copy the email address above.';
  }
});
document.querySelector('#contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')}\n\n${data.get('message')}`;
  window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(`TAC — ${data.get('interest')}`)}&body=${encodeURIComponent(body)}`;
  document.querySelector('#formStatus').textContent = 'Email draft requested. If your email app did not open, email us directly using the address shown on this page. Your enquiry has not been sent by this website.';
});
