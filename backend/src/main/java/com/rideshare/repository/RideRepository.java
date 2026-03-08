package com.rideshare.repository;

import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByDriverId(java.util.UUID driverId);

    @Query("SELECT r FROM Ride r WHERE r.driver.email = :email")
    List<Ride> findByDriverEmail(@Param("email") String email);

    @Query("SELECT r FROM Ride r WHERE LOWER(r.sourceCity) LIKE LOWER(CONCAT('%', :source, '%')) AND LOWER(r.destinationCity) LIKE LOWER(CONCAT('%', :dest, '%')) AND r.availableSeats > 0 AND r.status = 'CREATED'")
    List<Ride> searchRides(@Param("source") String source, @Param("dest") String dest);

    @Query("SELECT r FROM Ride r WHERE r.availableSeats > 0 AND r.status = 'CREATED' ORDER BY r.startTime ASC")
    List<Ride> findAllAvailable();
}
