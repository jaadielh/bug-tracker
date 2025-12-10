import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  // Get bugs
  const res = http.get('http://localhost:8080/api/bugs');
  check(res, { 'status is 200': r => r.status === 200 });

  // Create bug
  const payload = JSON.stringify({
    title: `Test Bug ${Date.now()}`,
    description: "This is a test bug created by k6",
    priority: "Medium",
    status: "Open",
  });

  const headers = { "Content-Type": "application/json" };

  const createBugRes = http.post(
    "http://localhost:8080/api/bugs",
    payload,
    { headers }
  );

  check(createBugRes, {
    "create bug status is 201": r => r.status === 201,
    "bug has an id": r => JSON.parse(r.body).id !== undefined,
  });

  sleep(1);
}
