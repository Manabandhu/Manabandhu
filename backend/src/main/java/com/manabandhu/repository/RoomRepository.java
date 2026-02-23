package com.manabandhu.repository;

import com.manabandhu.modules.travel.rooms.components.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Page<Room> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Room> findByTypeOrderByCreatedAtDesc(Room.RoomType type, Pageable pageable);
}