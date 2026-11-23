export function normalize(value, foldYo = false) {
  let text = String(value ?? '').normalize('NFC').replace(/\u0301/g, '').toLocaleLowerCase('ru-RU')
    .replace(/[.,!?;:«»“”"()…]/g, ' ').replace(/\s+/g, ' ').trim();
  return foldYo ? text.replace(/ё/g, 'е') : text;
}
export function isCorrect(value, answers, foldYo = false) {
  const valueNormalized = normalize(value, foldYo);
  return valueNormalized.length > 0 && answers.some(answer => normalize(answer, foldYo) === valueNormalized);
}
export function wordCount(text) { return (text.match(/[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*/gu) || []).length; }
export function speechComparison(expected, actual) {
  const a = normalize(expected, true).split(' ').filter(Boolean);
  const b = normalize(actual, true).split(' ').filter(Boolean);
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return Math.max(0, Math.round((1 - matrix[a.length][b.length] / Math.max(a.length, b.length, 1)) * 100));
}
export function validateBackup(data, lessonIds) {
  if (!data || data.version !== 1 || !data.progress || !data.drafts || !data.settings ||
      Array.isArray(data.progress) || Array.isArray(data.drafts) || typeof data.progress !== 'object' || typeof data.drafts !== 'object') return false;
  for (const [key, value] of Object.entries(data.progress)) {
    const [id, skill] = key.split(':');
    if (key !== `${id}:${skill}` || !lessonIds.includes(id) || !['listening','reading','speaking','writing'].includes(skill) ||
      !value || !Number.isFinite(value.best) || value.best < 0 || value.best > 100 || typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return false;
  }
  for (const [key, value] of Object.entries(data.drafts))
    if (!lessonIds.some(id => new RegExp(`^${id}:(writing(?::(?:practice|challenge))?|(?:listening|reading):(?:(?:practice|challenge):)?[0-2])$`).test(key)) || typeof value !== 'string' || value.length > 5000) return false;
  if (data.setResults !== undefined) {
    if (!data.setResults || typeof data.setResults !== 'object' || Array.isArray(data.setResults)) return false;
    for (const [key,value] of Object.entries(data.setResults)) {
      const [id,skill,bank]=key.split(':');
      if (key !== `${id}:${skill}:${bank}` || !lessonIds.includes(id) || !['listening','reading','writing'].includes(skill) || !['core','practice','challenge'].includes(bank) ||
          !value || !Number.isFinite(value.best) || value.best < 0 || value.best > 100 || typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return false;
    }
  }
  if (data.activity !== undefined && (!Array.isArray(data.activity) || data.activity.length > 400 || data.activity.some(day => typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)))) return false;
  return typeof data.settings.foldYo === 'boolean' && [0.65, 0.85, 1].includes(Number(data.settings.rate));
}
