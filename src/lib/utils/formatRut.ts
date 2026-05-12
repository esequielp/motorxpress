export const formatRut = (rut: string): string => {
  const clean = rut.replace(/\./g, '').replace('-', '');
  if (!clean) return '';
  const body  = clean.slice(0, -1);
  const dv    = clean.slice(-1);
  return `${Number(body).toLocaleString('es-CL')}-${dv}`;
};

export const validateRut = (rut: string): boolean => {
  if (!rut) return false;
  const clean = rut.replace(/\./g, '').replace('-', '').toUpperCase();
  if (clean.length < 2) return false;
  const body  = clean.slice(0, -1);
  const dv    = clean.slice(-1);
  let sum = 0, factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const expected = 11 - (sum % 11);
  const calc = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
  return calc === dv;
};
