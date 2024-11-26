import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const Calculator = () => {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState("15");
  const [numPeople, setNumPeople] = useState("1");

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const tip = (bill * parseFloat(tipPercentage)) / 100;
    const total = bill + tip;
    const perPerson = total / parseInt(numPeople);
    return {
      tip: tip.toFixed(2),
      total: total.toFixed(2),
      perPerson: perPerson.toFixed(2),
    };
  };

  const { tip, total, perPerson } = billAmount ? calculateTip() : { tip: "0.00", total: "0.00", perPerson: "0.00" };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Bill Calculator</CardTitle>
        <CardDescription>Split your bill and calculate tip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bill">Bill Amount</Label>
          <Input
            id="bill"
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="Enter bill amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tip">Tip Percentage</Label>
          <div className="flex space-x-2">
            {["10", "15", "20"].map((percentage) => (
              <Button
                key={percentage}
                variant={tipPercentage === percentage ? "default" : "outline"}
                onClick={() => setTipPercentage(percentage)}
              >
                {percentage}%
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="people">Number of People</Label>
          <Input
            id="people"
            type="number"
            min="1"
            value={numPeople}
            onChange={(e) => setNumPeople(e.target.value)}
          />
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Tip Amount:</span>
            <span className="font-bold">${tip}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-bold">${total}</span>
          </div>
          <div className="flex justify-between text-pizza-red">
            <span>Per Person:</span>
            <span className="font-bold">${perPerson}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calculator;