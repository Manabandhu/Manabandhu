package com.manabandhu.repository;

import com.manabandhu.modules.travel.rides.components.model.Ride;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    Page<Ride> findAllByOrderByDepartureTimeAsc(Pageable pageable);
}