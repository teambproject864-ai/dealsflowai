import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Scenario for 10 VUs over 1 minute
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    // Load test scenario
    load: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 100,
      stages: [
        { duration: '1m', target: 20 }, // Ramp up to 20 requests/s
        { duration: '2m', target: 50 }, // Stay at 50 requests/s
        { duration: '1m', target: 0 },  // Ramp down
      ],
      tags: { test_type: 'load' },
    },
  },
  // Thresholds for performance baselines
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% error rate
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test Landing Page
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'landing page status is 200': (r) => r.status === 200,
    'landing page has expected title': (r) => r.body.includes('DealFlow'),
  });
  sleep(1);

  // Test Features Page
  res = http.get(`${BASE_URL}/features`);
  check(res, {
    'features page status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // Test Pricing Page
  res = http.get(`${BASE_URL}/pricing`);
  check(res, {
    'pricing page status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
