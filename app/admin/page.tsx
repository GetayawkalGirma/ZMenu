// Server Component - SSR with data fetching
export default async function AdminDashboard() {
  // Fetch data on server (mock for now)
  const stats = await getDashboardStats();
  const recentRestaurants = await getRecentRestaurants();
  const recentPriceUpdates = await getRecentPriceUpdates();

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the ZMenu admin dashboard.
        </p>
      </div>

      {/* Stats Cards - Server Rendered */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Restaurants
          </h3>
          <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
          <p className="text-xs text-gray-500">
            +{stats.restaurantsGrowth} from last month
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Meals
          </h3>
          <div className="text-2xl font-bold">{stats.totalMeals}</div>
          <p className="text-xs text-gray-500">
            +{stats.mealsGrowth} from last month
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Active Users
          </h3>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-gray-500">
            +{stats.usersGrowth}% from last week
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Price Updates
          </h3>
          <div className="text-2xl font-bold">{stats.pendingPriceUpdates}</div>
          <p className="text-xs text-gray-500">Pending review</p>
        </div>
      </div>

      {/* Recent Activity - Server Rendered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Restaurants</h2>
          <div className="space-y-4">
            {recentRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="text-sm text-gray-500">
                    Added {restaurant.timeAgo}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    restaurant.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {restaurant.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Price Updates</h2>
          <div className="space-y-4">
            {recentPriceUpdates.map((update) => (
              <div
                key={update.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{update.mealName}</p>
                  <p className="text-sm text-gray-500">
                    {update.restaurantName}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      update.oldPrice < update.newPrice
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    ${update.oldPrice} → ${update.newPrice}
                  </p>
                  <p className="text-xs text-gray-500">{update.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side data fetching functions
async function getDashboardStats() {
  // Mock data - replace with actual API calls
  return {
    totalRestaurants: 12,
    restaurantsGrowth: 2,
    totalMeals: 248,
    mealsGrowth: 18,
    activeUsers: 1429,
    usersGrowth: 12,
    pendingPriceUpdates: 7,
  };
}

async function getRecentRestaurants() {
  // Mock data - replace with actual API calls
  return [
    {
      id: "1",
      name: "The Garden Bistro",
      timeAgo: "2 hours ago",
      status: "Active",
    },
    {
      id: "2",
      name: "Sushi Paradise",
      timeAgo: "5 hours ago",
      status: "Active",
    },
    {
      id: "3",
      name: "Burger Haven",
      timeAgo: "1 day ago",
      status: "Pending",
    },
  ];
}

async function getRecentPriceUpdates() {
  // Mock data - replace with actual API calls
  return [
    {
      id: "1",
      mealName: "Pasta Carbonara",
      restaurantName: "The Garden Bistro",
      oldPrice: 18,
      newPrice: 22,
      timeAgo: "2 hours ago",
    },
    {
      id: "2",
      mealName: "California Roll",
      restaurantName: "Sushi Paradise",
      oldPrice: 12,
      newPrice: 15,
      timeAgo: "5 hours ago",
    },
    {
      id: "3",
      mealName: "Classic Burger",
      restaurantName: "Burger Haven",
      oldPrice: 15,
      newPrice: 13,
      timeAgo: "1 day ago",
    },
  ];
}
