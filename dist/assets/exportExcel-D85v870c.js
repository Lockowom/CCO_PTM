import { utils as e, writeFile as l } from './xlsx-B2eTCt_Q.js';
function w({ filename: s, sheets: n }) {
  const o = e.book_new();
  (n || []).forEach((t, c) => {
    const i = e.json_to_sheet(t.rows || []),
      r = (t.name || `Hoja${c + 1}`).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31);
    e.book_append_sheet(o, i, r);
  });
  const a = new Date().toISOString().slice(0, 10);
  l(o, `${s}_${a}.xlsx`);
}
export { w as e };
