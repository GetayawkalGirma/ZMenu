import AddRestaurantClient from "./AddRestaurantClient";

export const metadata = {
  title: "Add a Restaurant — ZMenu",
  description: "Submit a restaurant to ZMenu. Upload menu images and let AI identify dishes.",
};

export default function AddRestaurantPage() {
  return <AddRestaurantClient />;
}
