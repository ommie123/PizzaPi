import { Pizza, Pi } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Pizza className="h-6 w-6 text-pizza-red" />
              <Pi className="h-6 w-6 text-pizza-orange" />
            </div>
            <p className="text-gray-600">
              The Perfect Slice to the Infinite Appetite
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-pizza-red">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-600 hover:text-pizza-red">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-pizza-red">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-pizza-red">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hours</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Monday - Friday: 11am - 10pm</li>
              <li>Saturday: 12pm - 11pm</li>
              <li>Sunday: 12pm - 9pm</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>123 Math Street</li>
              <li>Infinity City, IC 31415</li>
              <li>Phone: (555) 314-1592</li>
              <li>Email: slice@pizzapi.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Pizza Pi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;