package com.rideshare.repository;

import com.rideshare.model.RideParticipant;
import com.rideshare.model.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RideParticipantRepository extends JpaRepository<RideParticipant, Long> {
    boolean existsByRideIdAndRiderId(Long rideId, UUID riderId);

    @Query("SELECT p FROM RideParticipant p WHERE p.rider.id = :riderId ORDER BY p.joinedAt DESC")
    List<RideParticipant> findByRiderId(@Param("riderId") UUID riderId);

    List<RideParticipant> findByRideId(Long rideId);

    List<RideParticipant> findByRideIdAndStatus(Long rideId, ParticipantStatus status);
}
