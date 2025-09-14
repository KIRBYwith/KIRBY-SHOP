// src/components/order/OrderStepper.js

import React from "react";
import { ShoppingCart, Truck, CreditCard, BadgeCheck } from "lucide-react";

const steps = [
  { icon: <ShoppingCart />, label: "장바구니" },
  { icon: <Truck />, label: "주문/배송지" },
  { icon: <CreditCard />, label: "결제" },
  { icon: <BadgeCheck />, label: "완료" },
];

const OrderStepper = ({
  currentStep = 0, // 0~3
  stepLabels = steps,
  style = {},
}) => {
  return (
    <div
      className="order-stepper"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        margin: "2rem 0 2.5rem 0",
        ...style,
      }}
    >
      {stepLabels.map((step, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        return (
          <div
            key={step.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 75,
              opacity: isCompleted ? 0.5 : 1,
            }}
          >
            <div
              style={{
                background: isActive
                  ? "linear-gradient(90deg,#ff69b4, #fdcbf1)"
                  : "#faeafb",
                color: isActive ? "#fff" : "#ff69b4",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                border: isActive ? "3px solid #ffc3e2" : "2px solid #fde6fa",
                marginBottom: 7,
                boxShadow:
                  isActive && !isCompleted
                    ? "0 2px 9px #ff69b466"
                    : "none",
                transition: "all 0.2s",
                fontWeight: 700,
              }}
            >
              {step.icon}
            </div>
            <div
              style={{
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "#ff1493" : "#bbb",
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              {step.label}
            </div>
            {idx < stepLabels.length - 1 && (
              <div
                style={{
                  height: 3,
                  width: 50,
                  background: idx < currentStep
                    ? "linear-gradient(90deg,#ff69b4,#fdcbf1)"
                    : "#ffe3f2",
                  margin: "14px 0 0 0",
                  borderRadius: 3,
                  alignSelf: "center",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderStepper;
