// src/components/PayPalButton.jsx
import { useEffect, useRef } from 'react';

const PayPalButton = ({ amount, onSuccess, onError }) => {
    const paypalRef = useRef();

    useEffect(() => {
        // Ensure PayPal SDK is loaded before rendering buttons
        if (window.paypal) {
            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal',
                },
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toString(), // Ej: '20.00'
                            },
                        }],
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then(details => {
                        onSuccess(details);
                    });
                },
                onError: (err) => {
                    console.error('Error en el pago:', err);
                    onError(err);
                }
            }).render(paypalRef.current);
        } else {
            console.warn("PayPal SDK not loaded yet.");
            // You might want to handle this more gracefully, e.g., show a loading indicator
            // or an error message if the SDK fails to load after a timeout.
        }
    }, [amount, onSuccess, onError]); // Rerun if these props change

    return <div ref={paypalRef} />;
};

export default PayPalButton;