import { Pizza, Pi } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";

const Hero = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tableNumber = searchParams.get("table");

  const menuLink = tableNumber ? `/menu?table=${tableNumber}` : "/menu";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pizza-yellow via-white to-pizza-green overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <Pi className="absolute top-20 left-20 h-16 w-16 text-gray-200 animate-pizza-spin" />
        <Pizza className="absolute bottom-20 right-20 h-16 w-16 text-gray-200 animate-pizza-spin" />
        <Pi className="absolute top-40 right-40 h-8 w-8 text-gray-200 animate-pizza-spin" />
        <Pizza className="absolute bottom-40 left-40 h-8 w-8 text-gray-200 animate-pizza-spin" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="text-center">
          <div className="flex justify-center items-center mb-8">
            <Pizza className="h-16 w-16 text-pizza-red animate-pizza-spin" />
            <Pi className="h-16 w-16 text-pizza-orange" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pizza-red to-pizza-orange">
            Pizza Pi
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            The Perfect Slice to the Infinite Appetite
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
            <Link to={menuLink}>
              <Button size="lg" className="bg-pizza-red hover:bg-pizza-orange">
                Order Now
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;