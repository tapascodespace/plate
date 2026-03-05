import biryaniImg from "@/assets/biryani.jpg";
import paneerImg from "@/assets/paneer.jpg";
import rajmaImg from "@/assets/rajma.jpg";
import dosaImg from "@/assets/dosa.jpg";

export interface Dish {
  name: string;
  cook: string;
  price: string;
  portions: number;
  floor: number;
  image: string;
}

export const dishes: Dish[] = [
  { name: "Chicken Biryani", cook: "Ayesha", price: "₹180", portions: 6, floor: 4, image: biryaniImg },
  { name: "Paneer Butter Masala", cook: "Arjun", price: "₹150", portions: 3, floor: 8, image: paneerImg },
  { name: "Rajma Chawal", cook: "Neha", price: "₹120", portions: 8, floor: 2, image: rajmaImg },
  { name: "Masala Dosa", cook: "Raghav", price: "₹100", portions: 5, floor: 6, image: dosaImg },
];

const DishCard = ({ dish, index }: { dish: Dish; index: number }) => {
  return (
    <div
      className="group rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground">{dish.name}</h3>
        <p className="text-muted-foreground text-sm mt-1">Cooked by {dish.cook}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-foreground">{dish.price}</span>
          <span className="text-sm text-muted-foreground">{dish.portions} portions left</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">Pickup: Floor {dish.floor}</span>
          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95">
            Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
