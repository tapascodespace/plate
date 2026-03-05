import Link from "next/link";
import { Check, X, Star, ChefHat, ShoppingCart, ArrowUp, Shield, Users, MessageSquare, Building2 } from "lucide-react";

const dishes = [
  { name: "Chicken Biryani", cook: "Ayesha", price: "₹180", portions: 6, floor: 4, image: "/images/landing/biryani.jpg" },
  { name: "Paneer Butter Masala", cook: "Arjun", price: "₹150", portions: 3, floor: 8, image: "/images/landing/paneer.jpg" },
  { name: "Rajma Chawal", cook: "Neha", price: "₹120", portions: 8, floor: 2, image: "/images/landing/rajma.jpg" },
  { name: "Masala Dosa", cook: "Raghav", price: "₹100", portions: 5, floor: 6, image: "/images/landing/dosa.jpg" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background landing-page">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">plate</span>
          <div className="flex gap-3">
            <a href="#marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Menu</a>
            <a href="#chef" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cook</a>
          </div>
        </div>
      </nav>

      <section className="section-padding pt-40 md:pt-52 lg:pt-60 text-center max-w-5xl mx-auto">
        <h1 className="hero-text text-foreground">The best food<br />in your building.</h1>
        <p className="section-subtitle mt-8 max-w-xl mx-auto">
          Neighbors cook.<br />
          You order.<br />
          Hot homemade food in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/explore" className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-200 hover:opacity-90 active:scale-95">
            See what's cooking
          </Link>
          <Link href="/register" className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-medium text-lg transition-all duration-200 hover:bg-border active:scale-95">
            Become a home chef
          </Link>
        </div>

        <div className="mt-16 md:mt-24 animate-float">
          <div className="mx-auto max-w-sm bg-card border border-border rounded-[2rem] p-4 shadow-2xl shadow-foreground/5">
            <div className="w-16 h-1 bg-border rounded-full mx-auto mb-4" />
            <div className="space-y-3">
              {dishes.slice(0, 2).map((dish) => (
                <div key={dish.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                  <img src={dish.image} alt={dish.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">by {dish.cook} · {dish.price}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{dish.portions} left</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding max-w-5xl mx-auto">
        <h2 className="section-title text-foreground text-center">Cooking is all or nothing.</h2>
        <p className="section-subtitle text-center mt-8 max-w-2xl mx-auto">
          You either cook a full meal<br />
          or order expensive delivery.<br /><br />
          Meanwhile someone in your building<br />
          just made amazing food for twenty people.
        </p>
      </section>

      <section className="section-padding max-w-5xl mx-auto text-center">
        <h2 className="section-title text-foreground">Share the kitchen.</h2>
        <p className="section-subtitle mt-6 max-w-xl mx-auto">
          Plate turns every apartment building<br />
          into a shared kitchen.
        </p>
        <div className="grid md:grid-cols-3 gap-12 mt-20">
          {[
            { icon: ChefHat, title: "Cook", desc: "Residents list what they are cooking." },
            { icon: ShoppingCart, title: "Order", desc: "Neighbors reserve portions before cutoff time." },
            { icon: ArrowUp, title: "Pickup", desc: "Walk upstairs and collect your food." },
          ].map((step) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="marketplace" className="section-padding max-w-6xl mx-auto">
        <h2 className="section-title text-foreground text-center">What's cooking today</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {dishes.map((dish) => (
            <div key={dish.name} className="group rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-square overflow-hidden">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                  <Link href="/explore" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95">
                    Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding max-w-4xl mx-auto">
        <h2 className="section-title text-foreground text-center">
          Food delivery<br />optimized for buildings.
        </h2>
        <div className="mt-16 rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-5 text-left text-muted-foreground font-medium" />
                <th className="p-5 text-center font-bold text-primary text-lg">Plate</th>
                <th className="p-5 text-center font-medium text-muted-foreground text-lg">Delivery Apps</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Freshness", plate: "Hot off the stove", delivery: "30-45 min in a box" },
                { label: "Cost", plate: "₹100–200", delivery: "₹300–500+" },
                { label: "Speed", plate: "Walk 2 floors", delivery: "Wait 40 min" },
                { label: "Community", plate: "Know your cook", delivery: "Anonymous" },
              ].map((row, i) => (
                <tr key={row.label} className={i < 3 ? "border-b border-border" : ""}>
                  <td className="p-5 font-medium text-foreground">{row.label}</td>
                  <td className="p-5 text-center">
                    <span className="inline-flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary" /> {row.plate}
                    </span>
                  </td>
                  <td className="p-5 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <X className="w-4 h-4" /> {row.delivery}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-padding max-w-4xl mx-auto text-center">
        <h2 className="section-title text-foreground">Food creates community.</h2>
        <p className="section-subtitle mt-6">
          You know who cooked your food.<br />
          You thank them in the elevator.
        </p>
        <div className="mt-16 max-w-md mx-auto bg-card border border-border rounded-2xl p-8 text-left">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-xl font-medium text-foreground italic">"Best biryani in the building."</p>
          <p className="text-muted-foreground mt-4 text-sm">— Priya, Floor 6</p>
        </div>
      </section>

      <section id="chef" className="section-padding max-w-4xl mx-auto text-center">
        <h2 className="section-title text-foreground">Already cooking?<br />Earn from it.</h2>
        <p className="section-subtitle mt-6 max-w-xl mx-auto">
          If you're cooking anyway,<br />
          why not cook for a few more neighbors?
        </p>
        <div className="mt-16 max-w-md mx-auto bg-card border border-border rounded-2xl p-8">
          <div className="space-y-4 text-left">
            {[
              { label: "Dish name", value: "Chicken Biryani" },
              { label: "Portions available", value: "10" },
              { label: "Price per portion", value: "₹180" },
              { label: "Pickup window", value: "7:00 PM – 8:30 PM" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{field.label}</label>
                <div className="mt-1 p-3 rounded-xl bg-secondary text-foreground text-sm font-medium">{field.value}</div>
              </div>
            ))}
          </div>
          <Link href="/cook/menu" className="w-full mt-6 px-6 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-200 hover:opacity-90 active:scale-95 block">
            Publish dish
          </Link>
        </div>
      </section>

      <section className="section-padding max-w-4xl mx-auto text-center">
        <h2 className="section-title text-foreground">Built for home kitchens.</h2>
        <div className="grid sm:grid-cols-2 gap-8 mt-16 max-w-2xl mx-auto">
          {[
            { icon: Shield, text: "Verified residents" },
            { icon: Users, text: "Transparent cook profiles" },
            { icon: Star, text: "Ratings and reviews" },
            { icon: MessageSquare, text: "Future FSSAI compliant kitchens" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-4 p-6 rounded-2xl bg-secondary text-left">
              <item.icon className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-foreground font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding max-w-4xl mx-auto text-center">
        <h2 className="section-title text-foreground">One building at a time.</h2>
        <p className="section-subtitle mt-6 max-w-xl mx-auto">
          Plate begins inside one building.<br />
          Great home cooks spread it to the next building.
        </p>
        <div className="mt-16 flex items-center justify-center gap-4">
          {[1, 2, 3, 4, 5].map((n, i) => (
            <div key={n} className="flex items-center gap-4">
              <div className={`flex flex-col items-center ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                <Building2 className={`w-10 h-10 ${i === 0 ? "text-primary" : i < 3 ? "text-foreground" : "text-border"}`} />
                <div className={`w-2 h-2 rounded-full mt-2 ${i === 0 ? "bg-primary" : i < 3 ? "bg-foreground" : "bg-border"}`} />
              </div>
              {i < 4 && <div className={`w-8 h-px ${i < 2 ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding max-w-4xl mx-auto text-center">
        <h2 className="section-title text-foreground">See what's cooking tonight.</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/explore" className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-200 hover:opacity-90 active:scale-95">
            Find food in your building
          </Link>
          <Link href="/register" className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-medium text-lg transition-all duration-200 hover:bg-border active:scale-95">
            Start cooking for neighbors
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 text-center border-t border-border">
        <p className="text-muted-foreground text-sm">© 2026 Plate. Food from your building.</p>
      </footer>
    </div>
  );
}
