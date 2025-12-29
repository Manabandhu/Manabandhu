package com.manabandhu.dto.rooms;

import com.manabandhu.model.room.RoomListing;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class RoomListingResponse {
    private UUID id;
    private String ownerUserId;
    private String title;
    private RoomListing.ListingFor listingFor;
    private RoomListing.RoomType roomType;
    private int peopleAllowed;
    private BigDecimal rentMonthly;
    private BigDecimal deposit;
    private LocalDate leaseStartDate;
    private LocalDate leaseEndDate;
    private boolean leaseExtendable;
    private boolean utilitiesIncluded;
    private List<String> utilities;
    private List<String> amenities;
    private RoomListing.VisitType visitType;
    private Map<String, Object> contactPreference;
    private String description;
    private boolean locationExactEnabled;
    private BigDecimal latExact;
    private BigDecimal lngExact;
    private BigDecimal latApprox;
    private BigDecimal lngApprox;
    private String approxAreaLabel;
    private List<String> nearbyLocalities;
    private List<String> nearbySchools;
    private List<String> nearbyCompanies;
    private List<String> imageUrls;
    private RoomListing.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime hiddenAt;
    private boolean owner;
    private boolean canReview;
    private boolean saved;
    private long viewCount;

    public RoomListingResponse(RoomListing listing, boolean owner, boolean canReview) {
        this.id = listing.getId();
        this.ownerUserId = listing.getOwnerUserId();
        this.title = listing.getTitle();
        this.listingFor = listing.getListingFor();
        this.roomType = listing.getRoomType();
        this.peopleAllowed = listing.getPeopleAllowed();
        this.rentMonthly = listing.getRentMonthly();
        this.deposit = listing.getDeposit();
        this.leaseStartDate = listing.getLeaseStartDate();
        this.leaseEndDate = listing.getLeaseEndDate();
        this.leaseExtendable = listing.isLeaseExtendable();
        this.utilitiesIncluded = listing.isUtilitiesIncluded();
        this.utilities = listing.getUtilities();
        this.amenities = listing.getAmenities();
        this.visitType = listing.getVisitType();
        this.contactPreference = listing.getContactPreference();
        this.description = listing.getDescription();
        this.locationExactEnabled = listing.isLocationExactEnabled();
        this.latExact = listing.getLatExact();
        this.lngExact = listing.getLngExact();
        this.latApprox = listing.getLatApprox();
        this.lngApprox = listing.getLngApprox();
        this.approxAreaLabel = listing.getApproxAreaLabel();
        this.nearbyLocalities = listing.getNearbyLocalities();
        this.nearbySchools = listing.getNearbySchools();
        this.nearbyCompanies = listing.getNearbyCompanies();
        this.imageUrls = listing.getImageUrls();
        this.status = listing.getStatus();
        this.createdAt = listing.getCreatedAt();
        this.updatedAt = listing.getUpdatedAt();
        this.lastActivityAt = listing.getLastActivityAt();
        this.hiddenAt = listing.getHiddenAt();
        this.owner = owner;
        this.canReview = canReview;
        this.saved = false;
        this.viewCount = 0;
    }

    public UUID getId() {
        return id;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public String getTitle() {
        return title;
    }

    public RoomListing.ListingFor getListingFor() {
        return listingFor;
    }

    public RoomListing.RoomType getRoomType() {
        return roomType;
    }

    public int getPeopleAllowed() {
        return peopleAllowed;
    }

    public BigDecimal getRentMonthly() {
        return rentMonthly;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public LocalDate getLeaseStartDate() {
        return leaseStartDate;
    }

    public LocalDate getLeaseEndDate() {
        return leaseEndDate;
    }

    public boolean isLeaseExtendable() {
        return leaseExtendable;
    }

    public boolean isUtilitiesIncluded() {
        return utilitiesIncluded;
    }

    public List<String> getUtilities() {
        return utilities;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public RoomListing.VisitType getVisitType() {
        return visitType;
    }

    public Map<String, Object> getContactPreference() {
        return contactPreference;
    }

    public String getDescription() {
        return description;
    }

    public boolean isLocationExactEnabled() {
        return locationExactEnabled;
    }

    public BigDecimal getLatExact() {
        return latExact;
    }

    public BigDecimal getLngExact() {
        return lngExact;
    }

    public BigDecimal getLatApprox() {
        return latApprox;
    }

    public BigDecimal getLngApprox() {
        return lngApprox;
    }

    public String getApproxAreaLabel() {
        return approxAreaLabel;
    }

    public List<String> getNearbyLocalities() {
        return nearbyLocalities;
    }

    public List<String> getNearbySchools() {
        return nearbySchools;
    }

    public List<String> getNearbyCompanies() {
        return nearbyCompanies;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public RoomListing.Status getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public LocalDateTime getHiddenAt() {
        return hiddenAt;
    }

    public boolean isOwner() {
        return owner;
    }

    public boolean isCanReview() {
        return canReview;
    }

    public boolean isSaved() {
        return saved;
    }

    public void setSaved(boolean saved) {
        this.saved = saved;
    }

    public long getViewCount() {
        return viewCount;
    }

    public void setViewCount(long viewCount) {
        this.viewCount = viewCount;
    }
}
