import dashboardDataUrl from '../../data/dashboard.json?url';

export async function fetchDashboardData() {
  const response = await fetch(dashboardDataUrl);

  if (!response.ok) {
    throw new Error('Unable to load dashboard data');
  }

  return response.json();
}
