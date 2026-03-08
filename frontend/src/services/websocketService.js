import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

let stompClient = null;

export const connectToRide = (rideId, onLocationUpdate, onConnected) => {
    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        onConnect: () => {
            stompClient.subscribe(`/topic/ride/${rideId}`, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    onLocationUpdate(payload);
                } catch (e) {
                    console.error('WS parse error', e);
                }
            });
            if (onConnected) onConnected();
        },
        onStompError: (frame) => {
            console.warn('STOMP error:', frame.headers['message']);
        },
    });
    stompClient.activate();
    return stompClient;
};

export const disconnectRide = () => {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
    }
};

// Simulate GPS updates when backend WS is not available
export const simulateGPS = (start, destination, onUpdate, intervalRef) => {
    if (!start || !destination) return;
    let step = 0;
    const steps = 30;
    const latStep = (destination[0] - start[0]) / steps;
    const lngStep = (destination[1] - start[1]) / steps;

    intervalRef.current = setInterval(() => {
        if (step >= steps) {
            clearInterval(intervalRef.current);
            return;
        }
        onUpdate({
            lat: start[0] + latStep * step,
            lng: start[1] + lngStep * step,
        });
        step++;
    }, 1000);
};
