// ============================================================
//  Motor de fórmulas (tipo Excel) para campos calculados del Builder.
//  Port 1:1 del lib/formulaEngine.ts + businessDays.ts del repo panel-.
//  Sin eval(): tokenizer + parser de descenso recursivo + evaluador.
//  Puro (sin React/Supabase). evaluateFormula("DATEDIFF(a,b)", row) → número.
// ============================================================

// ---------- businessDays ----------
function addBusinessDays(startDate, days) {
  const result = new Date(startDate);
  let added = 0;
  const dow = result.getDay();
  if (dow === 0) result.setDate(result.getDate() + 1);
  else if (dow === 6) result.setDate(result.getDate() + 2);
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const d = result.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  return result;
}

// ---------- Tokenizer ----------
const OPS_2 = ['==', '!=', '<>', '<=', '>=', '&&', '||'];
const OPS_1 = ['+', '-', '*', '/', '%', '<', '>', '=', '!'];

function tokenize(input) {
  const toks = [];
  let i = 0;
  const n = input.length;
  while (i < n) {
    const c = input[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if (c === '"' || c === "'") {
      const quote = c; let j = i + 1; let s = '';
      while (j < n && input[j] !== quote) {
        if (input[j] === '\\' && j + 1 < n) { s += input[j + 1]; j += 2; continue; }
        s += input[j]; j++;
      }
      if (j >= n) throw new Error('String sin cerrar');
      toks.push({ type: 'str', value: s }); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(input[i + 1] || ''))) {
      let j = i; while (j < n && /[0-9.]/.test(input[j])) j++;
      toks.push({ type: 'num', value: input.slice(i, j) }); i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i; while (j < n && /[A-Za-z0-9_]/.test(input[j])) j++;
      toks.push({ type: 'ident', value: input.slice(i, j) }); i = j; continue;
    }
    if (c === '(') { toks.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (c === ')') { toks.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (c === ',') { toks.push({ type: 'comma', value: ',' }); i++; continue; }
    const two = input.slice(i, i + 2);
    if (OPS_2.indexOf(two) >= 0) { toks.push({ type: 'op', value: two }); i += 2; continue; }
    if (OPS_1.indexOf(c) >= 0) { toks.push({ type: 'op', value: c }); i++; continue; }
    throw new Error(`Carácter inesperado: "${c}"`);
  }
  toks.push({ type: 'eof', value: '' });
  return toks;
}

// ---------- Parser (descenso recursivo por precedencia) ----------
class Parser {
  constructor(toks) { this.toks = toks; this.pos = 0; }
  peek() { return this.toks[this.pos]; }
  next() { return this.toks[this.pos++]; }
  expect(type) { const t = this.next(); if (t.type !== type) throw new Error(`Se esperaba ${type} pero vino "${t.value || t.type}"`); return t; }
  parse() { const node = this.parseOr(); if (this.peek().type !== 'eof') throw new Error(`Token sobrante: "${this.peek().value}"`); return node; }
  parseOr() { let l = this.parseAnd(); while (this.peek().type === 'op' && this.peek().value === '||') { this.next(); l = { t: 'bin', op: '||', l, r: this.parseAnd() }; } return l; }
  parseAnd() { let l = this.parseEquality(); while (this.peek().type === 'op' && this.peek().value === '&&') { this.next(); l = { t: 'bin', op: '&&', l, r: this.parseEquality() }; } return l; }
  parseEquality() { let l = this.parseCompare(); while (this.peek().type === 'op' && ['=', '==', '!=', '<>'].indexOf(this.peek().value) >= 0) { const op = this.next().value; l = { t: 'bin', op, l, r: this.parseCompare() }; } return l; }
  parseCompare() { let l = this.parseAdd(); while (this.peek().type === 'op' && ['<', '<=', '>', '>='].indexOf(this.peek().value) >= 0) { const op = this.next().value; l = { t: 'bin', op, l, r: this.parseAdd() }; } return l; }
  parseAdd() { let l = this.parseMul(); while (this.peek().type === 'op' && ['+', '-'].indexOf(this.peek().value) >= 0) { const op = this.next().value; l = { t: 'bin', op, l, r: this.parseMul() }; } return l; }
  parseMul() { let l = this.parseUnary(); while (this.peek().type === 'op' && ['*', '/', '%'].indexOf(this.peek().value) >= 0) { const op = this.next().value; l = { t: 'bin', op, l, r: this.parseUnary() }; } return l; }
  parseUnary() { if (this.peek().type === 'op' && (this.peek().value === '-' || this.peek().value === '!')) { const op = this.next().value; return { t: 'unary', op, arg: this.parseUnary() }; } return this.parsePrimary(); }
  parsePrimary() {
    const t = this.peek();
    if (t.type === 'num') { this.next(); return { t: 'num', v: parseFloat(t.value) }; }
    if (t.type === 'str') { this.next(); return { t: 'str', v: t.value }; }
    if (t.type === 'lparen') { this.next(); const e = this.parseOr(); this.expect('rparen'); return e; }
    if (t.type === 'ident') {
      this.next();
      const up = t.value.toUpperCase();
      if (up === 'TRUE') return { t: 'bool', v: true };
      if (up === 'FALSE') return { t: 'bool', v: false };
      if (up === 'NULL') return { t: 'null' };
      if (this.peek().type === 'lparen') {
        this.next(); const args = [];
        if (this.peek().type !== 'rparen') { args.push(this.parseOr()); while (this.peek().type === 'comma') { this.next(); args.push(this.parseOr()); } }
        this.expect('rparen');
        return { t: 'call', name: up, args };
      }
      return { t: 'field', name: t.value };
    }
    throw new Error(`Token inesperado: "${t.value || t.type}"`);
  }
}

// ---------- Coerción ----------
function toNum(v) { if (v === null || v === undefined || v === '') return NaN; if (typeof v === 'number') return v; if (typeof v === 'boolean') return v ? 1 : 0; const n = parseFloat(String(v)); return isNaN(n) ? NaN : n; }
function toBool(v) { if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; if (v === null || v === undefined) return false; const s = String(v).toLowerCase().trim(); return s !== '' && s !== 'false' && s !== '0' && s !== 'no'; }
function toStr(v) { if (v === null || v === undefined) return ''; if (v instanceof Date) return v.toISOString(); return String(v); }

// ---------- Fecha anclada a Chile ----------
const TZ_CHILE = 'America/Santiago';
const MS_DAY = 86400000;
const MS_HOUR = 3600000;
function absToChile(d) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ_CHILE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
  const g = (t) => Number(p.find((x) => x.type === t).value);
  const hh = g('hour') % 24;
  return new Date(Date.UTC(g('year'), g('month') - 1, g('day'), hh, g('minute'), g('second')));
}
export function nowChile() { return absToChile(new Date()); }
function toDate(v) {
  if (v instanceof Date) return v;
  if (v === null || v === undefined || v === '') return new Date(NaN);
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0, 0));
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m && !/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)));
  const abs = new Date(s);
  if (isNaN(abs.getTime())) return abs;
  return absToChile(abs);
}
function businessDaysBetween(a, b) {
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return NaN;
  let sign = 1; let start = a; let end = b;
  if (a > b) { sign = -1; start = b; end = a; }
  let count = 0;
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cur < last) { cur.setUTCDate(cur.getUTCDate() + 1); const d = cur.getUTCDay(); if (d !== 0 && d !== 6) count++; }
  return count * sign;
}

// ---------- Funciones ----------
const FUNCS = {
  SUM: (a) => a.flat().reduce((s, x) => s + (toNum(x) || 0), 0),
  AVG: (a) => { const f = a.flat().map(toNum).filter((x) => !isNaN(x)); return f.length ? f.reduce((s, x) => s + x, 0) / f.length : NaN; },
  MIN: (a) => Math.min(...a.flat().map(toNum)),
  MAX: (a) => Math.max(...a.flat().map(toNum)),
  ROUND: (a) => { const n = toNum(a[0]); const d = a.length > 1 ? toNum(a[1]) : 0; const f = Math.pow(10, d); return Math.round(n * f) / f; },
  ABS: (a) => Math.abs(toNum(a[0])),
  NOW: (_a, ctx) => ctx.now,
  TODAY: (_a, ctx) => { const d = new Date(ctx.now); d.setUTCHours(0, 0, 0, 0); return d; },
  DATEDIFF: (a) => { const d1 = toDate(a[0]), d2 = toDate(a[1]); if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return NaN; return Math.round((d2.getTime() - d1.getTime()) / MS_DAY); },
  HOURS_DIFF: (a) => { const d1 = toDate(a[0]), d2 = toDate(a[1]); if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return NaN; return Math.round((d2.getTime() - d1.getTime()) / MS_HOUR * 10) / 10; },
  BUSINESS_DAYS: (a) => businessDaysBetween(toDate(a[0]), toDate(a[1])),
  ADD_BUSINESS_DAYS: (a) => addBusinessDays(toDate(a[0]), Math.round(toNum(a[1]))),
  IF: (a) => (toBool(a[0]) ? a[1] : (a.length > 2 ? a[2] : null)),
  AND: (a) => a.every(toBool),
  OR: (a) => a.some(toBool),
  NOT: (a) => !toBool(a[0]),
  CONCAT: (a) => a.map(toStr).join(''),
  UPPER: (a) => toStr(a[0]).toUpperCase(),
  LOWER: (a) => toStr(a[0]).toLowerCase(),
  CONTAINS: (a) => toStr(a[0]).toLowerCase().includes(toStr(a[1]).toLowerCase()),
  NV_ANTIGUEDAD: (a, ctx) => { const d = toDate(a[0]); if (isNaN(d.getTime())) return NaN; return Math.round((ctx.now.getTime() - d.getTime()) / MS_HOUR * 10) / 10; },
  OTIF_STATUS: (a, ctx) => {
    const entrega = toDate(a[0]); const compromiso = toDate(a[1]); const estado = toStr(a[2]).toLowerCase();
    const entregado = estado.includes('recibido') || estado.includes('entregad') || !isNaN(entrega.getTime());
    if (entregado && !isNaN(entrega.getTime()) && !isNaN(compromiso.getTime())) return entrega.getTime() <= compromiso.getTime() ? 'OK' : 'FAIL';
    if (!isNaN(compromiso.getTime())) { const h = (compromiso.getTime() - ctx.now.getTime()) / MS_HOUR; return h < 24 ? 'RISK' : 'PEND'; }
    return 'PEND';
  },
  RIESGO_OTIF: (a, ctx) => { const compromiso = toDate(a[0]); const estado = toStr(a[1]).toLowerCase(); const entregado = estado.includes('recibido') || estado.includes('entregad'); if (entregado || isNaN(compromiso.getTime())) return false; const h = (compromiso.getTime() - ctx.now.getTime()) / MS_HOUR; return h < 24; },
  PRIORIDAD_OPERACIONAL: (a, ctx) => { const estado = toStr(a[1]).toLowerCase(); if (estado.includes('recibido') || estado.includes('entregad')) return 'FINALIZADA'; const compromiso = toDate(a[0]); if (isNaN(compromiso.getTime())) return 'NORMAL'; const h = (compromiso.getTime() - ctx.now.getTime()) / MS_HOUR; if (h < 0) return 'CRITICA'; if (h < 12) return 'ALTA'; if (h < 24) return 'MEDIA'; return 'NORMAL'; },
};

// ---------- Evaluador ----------
function evalNode(node, row, ctx) {
  switch (node.t) {
    case 'num': return node.v;
    case 'str': return node.v;
    case 'bool': return node.v;
    case 'null': return null;
    case 'field': {
      if (node.name in row) return row[node.name];
      const lower = node.name.toLowerCase();
      for (const k in row) if (k.toLowerCase() === lower) return row[k];
      return null;
    }
    case 'unary': { const v = evalNode(node.arg, row, ctx); if (node.op === '-') return -toNum(v); if (node.op === '!') return !toBool(v); return null; }
    case 'bin': {
      const op = node.op;
      if (op === '&&') return toBool(evalNode(node.l, row, ctx)) && toBool(evalNode(node.r, row, ctx));
      if (op === '||') return toBool(evalNode(node.l, row, ctx)) || toBool(evalNode(node.r, row, ctx));
      const l = evalNode(node.l, row, ctx); const r = evalNode(node.r, row, ctx);
      switch (op) {
        case '+': if (typeof l === 'string' || typeof r === 'string') { const ln = toNum(l), rn = toNum(r); if (isNaN(ln) || isNaN(rn)) return toStr(l) + toStr(r); return ln + rn; } return toNum(l) + toNum(r);
        case '-': return toNum(l) - toNum(r);
        case '*': return toNum(l) * toNum(r);
        case '/': return toNum(l) / toNum(r);
        case '%': return toNum(l) % toNum(r);
        case '<': return cmp(l, r) < 0;
        case '<=': return cmp(l, r) <= 0;
        case '>': return cmp(l, r) > 0;
        case '>=': return cmp(l, r) >= 0;
        case '=': case '==': return eq(l, r);
        case '!=': case '<>': return !eq(l, r);
      }
      return null;
    }
    case 'call': { const fn = FUNCS[node.name]; if (!fn) throw new Error(`Función desconocida: ${node.name}`); const args = node.args.map((arg) => evalNode(arg, row, ctx)); return fn(args, ctx); }
    default: return null;
  }
}
function eq(l, r) { if (typeof l === 'number' || typeof r === 'number') { const ln = toNum(l), rn = toNum(r); if (!isNaN(ln) && !isNaN(rn)) return ln === rn; } if (typeof l === 'boolean' || typeof r === 'boolean') return toBool(l) === toBool(r); return toStr(l).toLowerCase() === toStr(r).toLowerCase(); }
function cmp(l, r) { const ln = toNum(l), rn = toNum(r); if (!isNaN(ln) && !isNaN(rn)) return ln === rn ? 0 : (ln < rn ? -1 : 1); const ls = toStr(l), rs = toStr(r); return ls === rs ? 0 : (ls < rs ? -1 : 1); }

// ---------- API pública ----------
export function compileFormula(formula) { return new Parser(tokenize(formula)).parse(); }
export function sanitizeValue(v) { if (typeof v === 'number' && !isFinite(v)) return null; if (v instanceof Date) return isNaN(v.getTime()) ? null : v; return v; }
export function extractFields(formula) {
  let ast; try { ast = compileFormula(formula); } catch { return []; }
  const set = new Set();
  const walk = (n) => { switch (n.t) { case 'field': set.add(n.name); break; case 'unary': walk(n.arg); break; case 'bin': walk(n.l); walk(n.r); break; case 'call': n.args.forEach(walk); break; default: break; } };
  walk(ast); return Array.from(set);
}
export function validarFormula(formula) { try { compileFormula(formula); return { ok: true }; } catch (e) { return { ok: false, error: e?.message || 'Fórmula inválida' }; } }
export function evaluateFormula(formula, row, now) {
  try { const ast = compileFormula(formula); const value = sanitizeValue(evalNode(ast, row || {}, { now: now || nowChile() })); return { ok: true, value }; }
  catch (e) { return { ok: false, value: null, error: e?.message || 'Error al evaluar' }; }
}
export function makeFormula(formula) {
  let ast = null; let compileErr = null;
  try { ast = compileFormula(formula); } catch (e) { compileErr = e?.message || 'Fórmula inválida'; }
  return (row, now) => { if (compileErr || !ast) return { ok: false, value: null, error: compileErr || 'Fórmula inválida' }; try { return { ok: true, value: evalNode(ast, row || {}, { now: now || nowChile() }) }; } catch (e) { return { ok: false, value: null, error: e?.message || 'Error al evaluar' }; } };
}
export function extendRows(rows, calcFields, now) {
  if (!rows?.length || !calcFields?.length) return rows;
  const compiled = calcFields.map((cf) => ({ nombre: cf.nombre, fn: makeFormula(cf.formula) }));
  const n = now || nowChile();
  return rows.map((row) => { const ext = { ...row }; for (const c of compiled) { const r = c.fn(ext, n); ext[c.nombre] = r.ok ? sanitizeValue(r.value) : null; } return ext; });
}
export const FUNCIONES_DISPONIBLES = Object.keys(FUNCS).sort();
