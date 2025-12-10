import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// ✅ K6 Load Configuration
export const options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// ✅ MAIN TEST EXECUTION
export default function () {
  // 1️⃣ Health Check / Read API
  const getRes = http.get('http://localhost:8080/api/bugs');

  check(getRes, {
    'GET /bugs status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2️⃣ Create Bug API Test
  const payload = JSON.stringify({
    title: `Test Bug ${Date.now()}`,
    description: 'This is a test bug created by k6',
    priority: 'Medium',
    status: 'Open',
  });

  const headers = { 'Content-Type': 'application/json' };

  const createBugRes = http.post(
    'http://localhost:8080/api/bugs',
    payload,
    { headers }
  );

  check(createBugRes, {
    'POST /bugs status is 201': (r) => r.status === 201,
    'bug has an ID': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(1);
}

// ✅ REPORT GENERATION FOR JENKINS
export function handleSummary(data) {
  return {
    'reports/perf-report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
