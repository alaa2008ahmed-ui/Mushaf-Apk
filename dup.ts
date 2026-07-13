import { INITIAL_DATA } from './allowances/data';
console.log("Length:", INITIAL_DATA.length);
const codes = new Set();
INITIAL_DATA.forEach(e => {
  if (codes.has(String(e.code).trim())) console.log("Dup code:", e.code, e.name);
  codes.add(String(e.code).trim());
});
