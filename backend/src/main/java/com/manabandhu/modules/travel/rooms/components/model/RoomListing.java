package com.manabandhu.modules.travel.rooms.components.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "room_listings")
@EntityListeners(AuditingEntityListener.class)
public class RoomListing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String ownerUserId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingFor listingFor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;

    @Column(nullable = false)
    private int peopleAllowed;

    @Column(nullable = false)
    private BigDecimal rentMonthly;

    @Column
    private BigDecimal deposit;

    @Column
    private LocalDate leaseStartDate;

    @Column
    private LocalDate leaseEndDate;

    @Column(name = "lease_extendable", nullable = false)
    private boolean leaseExtendable = false;

    @Column(nullable = false)
    private boolean utilitiesIncluded;

    @ElementCollection
    @CollectionTable(name = "room_listing_utilities", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "utility")
    private List<String> utilities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_listing_amenities", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitType visitType;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "TEXT")
    private Map<String, Object> contactPreference;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean locationExactEnabled;

    @Column(precision = 10, scale = 7)
    private BigDecimal latExact;

    @Column(precision = 10, scale = 7)
    private BigDecimal lngExact;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latApprox;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal lngApprox;

    @Column(nullable = false)
    private String approxAreaLabel;

    @ElementCollection
    @CollectionTable(name = "room_listing_nearby_localities", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "locality")
    private List<String> nearbyLocalities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_listing_nearby_schools", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "school")
    private List<String> nearbySchools = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_listing_nearby_companies", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "company")
    private List<String> nearbyCompanies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_listing_images", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @CreatedDate
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private LocalDateTime lastActivityAt;

    @Column
    private LocalDateTime hiddenAt;

    @Version
    private long version;

    public enum ListingFor {
        STUDENT,
        COUPLE,
        PROFESSIONAL,
        FAMILY
    }

    public enum RoomType {
        PRIVATE,
        SHARED,
        ENTIRE_UNIT
    }

    public enum VisitType {
        VIDEO_CALL,
        IN_PERSON,
        BOTH
    }

    public enum Status {
        AVAILABLE,
        IN_TALKS,
        BOOKED,
        HIDDEN,
        ARCHIVED,
        DELETED
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(String ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ListingFor getListingFor() {
        return listingFor;
    }

    public void setListingFor(ListingFor listingFor) {
        this.listingFor = listingFor;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public int getPeopleAllowed() {
        return peopleAllowed;
    }

    public void setPeopleAllowed(int peopleAllowed) {
        this.peopleAllowed = peopleAllowed;
    }

    public BigDecimal getRentMonthly() {
        return rentMonthly;
    }

    public void setRentMonthly(BigDecimal rentMonthly) {
        this.rentMonthly = rentMonthly;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public LocalDate getLeaseStartDate() {
        return leaseStartDate;
    }

    public void setLeaseStartDate(LocalDate leaseStartDate) {
        this.leaseStartDate = leaseStartDate;
    }

    public LocalDate getLeaseEndDate() {
        return leaseEndDate;
    }

    public void setLeaseEndDate(LocalDate leaseEndDate) {
        this.leaseEndDate = leaseEndDate;
    }

    public boolean isLeaseExtendable() {
        return leaseExtendable;
    }

    public void setLeaseExtendable(boolean leaseExtendable) {
        this.leaseExtendable = leaseExtendable;
    }

    public boolean isUtilitiesIncluded() {
        return utilitiesIncluded;
    }

    public void setUtilitiesIncluded(boolean utilitiesIncluded) {
        this.utilitiesIncluded = utilitiesIncluded;
    }

    public List<String> getUtilities() {
        return utilities;
    }

    public void setUtilities(List<String> utilities) {
        this.utilities = utilities;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public VisitType getVisitType() {
        return visitType;
    }

    public void setVisitType(VisitType visitType) {
        this.visitType = visitType;
    }

    public Map<String, Object> getContactPreference() {
        return contactPreference;
    }

    public void setContactPreference(Map<String, Object> contactPreference) {
        this.contactPreference = contactPreference;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isLocationExactEnabled() {
        return locationExactEnabled;
    }

    public void setLocationExactEnabled(boolean locationExactEnabled) {
        this.locationExactEnabled = locationExactEnabled;
    }

    public BigDecimal getLatExact() {
        return latExact;
    }

    public void setLatExact(BigDecimal latExact) {
        this.latExact = latExact;
    }

    public BigDecimal getLngExact() {
        return lngExact;
    }

    public void setLngExact(BigDecimal lngExact) {
        this.lngExact = lngExact;
    }

    public BigDecimal getLatApprox() {
        return latApprox;
    }

    public void setLatApprox(BigDecimal latApprox) {
        this.latApprox = latApprox;
    }

    public BigDecimal getLngApprox() {
        return lngApprox;
    }

    public void setLngApprox(BigDecimal lngApprox) {
        this.lngApprox = lngApprox;
    }

    public String getApproxAreaLabel() {
        return approxAreaLabel;
    }

    public void setApproxAreaLabel(String approxAreaLabel) {
        this.approxAreaLabel = approxAreaLabel;
    }

    public List<String> getNearbyLocalities() {
        return nearbyLocalities;
    }

    public void setNearbyLocalities(List<String> nearbyLocalities) {
        this.nearbyLocalities = nearbyLocalities;
    }

    public List<String> getNearbySchools() {
        return nearbySchools;
    }

    public void setNearbySchools(List<String> nearbySchools) {
        this.nearbySchools = nearbySchools;
    }

    public List<String> getNearbyCompanies() {
        return nearbyCompanies;
    }

    public void setNearbyCompanies(List<String> nearbyCompanies) {
        this.nearbyCompanies = nearbyCompanies;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public LocalDateTime getHiddenAt() {
        return hiddenAt;
    }

    public void setHiddenAt(LocalDateTime hiddenAt) {
        this.hiddenAt = hiddenAt;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }
}
