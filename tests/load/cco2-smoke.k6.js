import http from 'k6/http';
import { check, sleep } from 'k6';

/* global __ENV */

export const options = {
  scenarios: {
    read_smoke: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 }
      ]
    }
  },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<2000'] }
};

export default function () {
  const base = __ENV.CCO_BASE_URL;
  if (!base) throw new Error('CCO_BASE_URL es obligatorio');
  const response = http.get(`${base}/`);
  check(response, { 'sin error 5xx': (r) => r.status < 500 });
  sleep(1);
}
