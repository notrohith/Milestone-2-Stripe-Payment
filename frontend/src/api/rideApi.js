import axiosClient from "./axiosClient";

export const syncUser = (user) => {
    return axiosClient.post("/api/auth/sync", user);
}

export const createRide = (rideData) => {
    return axiosClient.post("/api/rides", rideData);
};

export const searchRides = (source, dest) => {
    return axiosClient.get(`/api/rides/search?source=${source}&dest=${dest}`);
};

export const getMyRides = () => {
    return axiosClient.get("/api/rides/my-rides");
};

export const joinRide = (rideId) => {
    return axiosClient.post(`/api/rides/${rideId}/join`);
};

export const updateRideStatus = (rideId, status) => {
    return axiosClient.patch(`/api/rides/${rideId}/status`, { status });
};
