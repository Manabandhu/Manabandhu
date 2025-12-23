package com.manabandhu.repository;

import com.manabandhu.model.room.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Page<Room> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Room> findByTypeOrderByCreatedAtDesc(Room.RoomType type, Pageable pageable);
}

@Repository
interface RideRepository extends JpaRepository<com.manabandhu.model.ride.Ride, Long> {
    Page<com.manabandhu.model.ride.Ride> findAllByOrderByDepartureTimeAsc(Pageable pageable);
}