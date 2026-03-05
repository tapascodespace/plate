import DishCard, { dishes } from "@/components/DishCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Check, X, Star, ChefHat, ShoppingCart, ArrowUp, Shield, Users, MessageSquare, Building2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">plate</span>
          <div className="flex gap-3">
            <a href="#marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Menu</a>
            <a href="#chef" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cook</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding pt-32 md:pt-40 lg:pt-48 text-center max-w-5xl mx-auto">
        <AnimateOnScroll>
          <h1 className="hero-text text-foreground">
            The best food<br />in your building.
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <p className="section-subtitle mt-8 max-w-xl mx-auto">
            Neighbors cook.<br />
            You order.<br />
            Hot homemade food in minutes.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={400}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a href="#marketplace" className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-200 hover:opacity-90 active:scale-95">
              See what's cooking
            </a>
            <a href="#chef" className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-medium text-lg transition-all duration-200 hover:bg-border active:scale-95">
              Become a home chef
            </a>
          </div>
        </AnimateOnScroll>

        {/* Floating phone mockup */}
        <AnimateOnScroll delay={500}>
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
        </AnimateOnScroll>
      </section>

      {/* Problem */}
      <section className="section-padding max-w-5xl mx-auto">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground text-center">
            Cooking is all or nothing.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <p className="section-subtitle text-center mt-8 max-w-2xl mx-auto">
            You either cook a full meal<br />
            or order expensive delivery.<br /><br />
            Meanwhile someone in your building<br />
            just made amazing food for twenty people.
          </p>
        </AnimateOnScroll>
      </section>

      {/* Solution */}
      <section className="section-padding max-w-5xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground">Share the kitchen.</h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <p className="section-subtitle mt-6 max-w-xl mx-auto">
            Plate turns every apartment building<br />
            into a shared kitchen.
          </p>
        </AnimateOnScroll>
        <div className="grid md:grid-cols-3 gap-12 mt-20">
          {[
            { icon: ChefHat, title: "Cook", desc: "Residents list what they are cooking." },
            { icon: ShoppingCart, title: "Order", desc: "Neighbors reserve portions before the cutoff time." },
            { icon: ArrowUp, title: "Pickup", desc: "Walk upstairs and collect your food." },
          ].map((step, i) => (
            <AnimateOnScroll key={step.title} delay={i * 150}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Marketplace */}
      <section id="marketplace" className="section-padding max-w-6xl mx-auto">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground text-center">What's cooking today</h2>
        </AnimateOnScroll>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {dishes.map((dish, i) => (
            <AnimateOnScroll key={dish.name} delay={i * 100}>
              <DishCard dish={dish} index={i} />
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="section-padding max-w-4xl mx-auto">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground text-center">
            Food delivery<br />optimized for buildings.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
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
        </AnimateOnScroll>
      </section>

      {/* Social */}
      <section className="section-padding max-w-4xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground">Food creates community.</h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <p className="section-subtitle mt-6">
            You know who cooked your food.<br />
            You thank them in the elevator.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={300}>
          <div className="mt-16 max-w-md mx-auto bg-card border border-border rounded-2xl p-8 text-left">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-xl font-medium text-foreground italic">
              "Best biryani in the building."
            </p>
            <p className="text-muted-foreground mt-4 text-sm">— Priya, Floor 6</p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Chef */}
      <section id="chef" className="section-padding max-w-4xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground">
            Already cooking?<br />Earn from it.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <p className="section-subtitle mt-6 max-w-xl mx-auto">
            If you're cooking anyway,<br />
            why not cook for a few more neighbors?
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={300}>
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
            <button className="w-full mt-6 px-6 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-200 hover:opacity-90 active:scale-95">
              Publish dish
            </button>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Trust */}
      <section className="section-padding max-w-4xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground">Built for home kitchens.</h2>
        </AnimateOnScroll>
        <div className="grid sm:grid-cols-2 gap-8 mt-16 max-w-2xl mx-auto">
          {[
            { icon: Shield, text: "Verified residents" },
            { icon: Users, text: "Transparent cook profiles" },
            { icon: Star, text: "Ratings and reviews" },
            { icon: MessageSquare, text: "Future FSSAI compliant kitchens" },
          ].map((item, i) => (
            <AnimateOnScroll key={item.text} delay={i * 100}>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-secondary text-left">
                <item.icon className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Expansion */}
      <section className="section-padding max-w-4xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground">One building at a time.</h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <p className="section-subtitle mt-6 max-w-xl mx-auto">
            Plate begins inside one building.<br />
            Great home cooks spread it to the next building.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={300}>
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
        </AnimateOnScroll>
      </section>

      {/* Final CTA */}
      <section className="section-padding max-w-4xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="section-title text-foreground">See what's cooking tonight.</h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg transition-all duration-200 hover:opacity-90 active:scale-95">
              Find food in your building
            </button>
            <button className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-medium text-lg transition-all duration-200 hover:bg-border active:scale-95">
              Start cooking for neighbors
            </button>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-border">
        <p className="text-muted-foreground text-sm">© 2026 Plate. Food from your building.</p>
      </footer>
    </div>
  );
};

export default Index;
