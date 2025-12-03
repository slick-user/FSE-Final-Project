export async function mockAdminApi(page) {

  await page.route('**/api/login', async (route, request) => {
    const body = JSON.parse(request.postData() || '{}');

    if (body.rollNo === 'admin123' && body.password === 'admin123') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: "mock-admin-token",
          role: "admin",
          rollNo: "admin123"
        })
      });
    }

    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: "Invalid credentials" })
    });
  });

  const mockStops = [
    { id: 1, name: "Stop A", zone: "Islamabad", createdAt: "2025" },
    { id: 2, name: "Stop B", zone: "Rawalpindi", createdAt: "2025" }
  ];

  const mockBuses = [
    { id: 1, busId: "BUS-001", driverName: "John Doe", createdAt: "2025" }
  ];

  const mockRoutes = [
    { id: 1, routeName: "Route 1", from: "Stop A", to: "Stop B" }
  ];

  const mockSchedules = [
    { id: 1, routeName: "Route 1", busId: "BUS-001", driverName: "John Doe", time: "08:00" }
  ];

  await page.route('**/api/stops', route => {
    if (route.request().method() === 'GET') {
      return route.fulfillJSON(mockStops);
    }
  });

  await page.route('**/api/buses', route => {
    if (route.request().method() === 'GET') {
      return route.fulfillJSON(mockBuses);
    }
  });

  await page.route('**/api/routes', route => {
    if (route.request().method() === 'GET') {
      return route.fulfillJSON(mockRoutes);
    }
  });

  await page.route('**/api/schedules', route => {
    if (route.request().method() === 'GET') {
      return route.fulfillJSON(mockSchedules);
    }
  });

  const ok = {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ message: "Success" })
  };

  await page.route('**/api/stops', route => {
    if (route.request().method() === 'POST') return route.fulfill(ok);
  });

  await page.route('**/api/stops/*', route => {
    if (route.request().method() === 'DELETE') return route.fulfill(ok);
  });

  // buses
  await page.route('**/api/buses', route => {
    if (route.request().method() === 'POST') return route.fulfill(ok);
  });

  await page.route('**/api/buses/*', route => {
    if (route.request().method() === 'DELETE') return route.fulfill(ok);
  });

  // routes
  await page.route('**/api/routes', route => {
    if (route.request().method() === 'POST') return route.fulfill(ok);
  });

  await page.route('**/api/routes/*', route => {
    if (route.request().method() === 'DELETE') return route.fulfill(ok);
  });

  // schedules
  await page.route('**/api/schedules', route => {
    if (route.request().method() === 'POST') return route.fulfill(ok);
  });

  await page.route('**/api/schedules/*', route => {
    if (route.request().method() === 'DELETE') return route.fulfill(ok);
  });
}

export async function mockAdminSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem("authToken", "mock-admin-token");
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("rollNo", "admin123");
  });
}
