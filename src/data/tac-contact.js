export const contactEmail = 'tac.aisolution@gmail.com';
export const emailTac = (subject = 'TAC enquiry') => `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
export const contactLinks = {
  sales: emailTac('TAC product enquiry'),
  demo: emailTac('Request a TAC demo'),
  support: emailTac('TAC support enquiry'),
  partnership: emailTac('TAC partnership enquiry')
};
