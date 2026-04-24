import AddRestaurantClient from "./AddRestaurantClient";

export const metadata = {
  title: "Add a Restaurant — ZDish",
  description: "Submit a restaurant to ZDish. Upload menu images and let AI identify dishes.",
};

export default function AddRestaurantPage() {
  return <AddRestaurantClient />;
}
