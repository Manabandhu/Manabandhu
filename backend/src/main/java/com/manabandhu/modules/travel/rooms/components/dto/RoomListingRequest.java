package com.manabandhu.modules.travel.rooms.components.dto;

import com.manabandhu.modules.travel.rooms.components.model.RoomListing;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class RoomListingRequest {
    @NotBlank
    private String title;

    @NotNull
    private RoomListing.ListingFor listingFor;

    @NotNull
    private RoomListing.RoomType roomType;

    @Min(1)
    private int peopleAllowed;

    @NotNull
    @Positive
    private BigDecimal rentMonthly;

    private BigDecimal deposit;

    private LocalDate leaseStartDate;

    private LocalDate leaseEndDate;

    private boolean leaseExtendable;

    private boolean utilitiesIncluded;

    private List<String> utilities;

    private List<String> amenities;

    @NotNull
    private RoomListing.VisitType visitType;

    private Map<String, Object> contactPreference;

    private String description;

    private boolean locationExactEnabled;

    private BigDecimal latExact;

    private BigDecimal lngExact;

    @NotNull
    private BigDecimal latApprox;

    @NotNull
    private BigDecimal lngApprox;

    @NotBlank
    private String approxAreaLabel;

    private List<String> nearbyLocalities;

    private List<String> nearbySchools;

    private List<String> nearbyCompanies;

    private List<String> imageUrls;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public RoomListing.ListingFor getListingFor() {
        return listingFor;
    }

    public void setListingFor(RoomListing.ListingFor listingFor) {
        this.listingFor = listingFor;
    }

    public RoomListing.RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomListing.RoomType roomType) {
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

    public RoomListing.VisitType getVisitType() {
        return visitType;
    }

    public void setVisitType(RoomListing.VisitType visitType) {
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
}
