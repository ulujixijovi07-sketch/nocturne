"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalCheckoutProps {
  amount: number;
  orderData: any; // checkout body
  onSuccess: (orderNumber: string, customerEmail: string) => void;
  onError: (msg: string) => void;
  onCancel?: () => void;
}

function PayPalButtonInner({
  amount,
  orderData,
  onSuccess,
  onError,
  onCancel,
}: PayPalCheckoutProps) {
  const createOrder = async () => {
    try {
      const res = await fetch("/api/payment/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!data.orderID) throw new Error("Failed to create PayPal order");
      return data.orderID;
    } catch (e: any) {
      onError(e.message);
      throw e;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      // Capture the PayPal payment
      const captureRes = await fetch("/api/payment/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error || "Capture failed");

      // Now create the order in our database
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || "Failed to place order");

      onSuccess(checkoutData.orderNumber, checkoutData.customerEmail);
    } catch (e: any) {
      onError(e.message || "Payment failed");
    }
  };

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
      createOrder={createOrder}
      onApprove={onApprove}
      onCancel={() => onCancel?.()}
      onError={() => onError("PayPal encountered an error")}
    />
  );
}

export function PayPalCheckout(props: PayPalCheckoutProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!clientId) {
    return (
      <p className="text-center font-body text-sm text-text-secondary py-4">
        PayPal is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtonInner {...props} />
    </PayPalScriptProvider>
  );
}
