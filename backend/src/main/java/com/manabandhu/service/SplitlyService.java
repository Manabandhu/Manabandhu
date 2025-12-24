package com.manabandhu.service;

import com.manabandhu.dto.splitly.*;
import com.manabandhu.model.User;
import com.manabandhu.model.splitly.*;
import com.manabandhu.repository.UserRepository;
import com.manabandhu.repository.splitly.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SplitlyService {

    private final SplitGroupRepository splitGroupRepository;
    private final SplitExpenseRepository splitExpenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final UserRepository userRepository;

    public SplitGroupDTO createGroup(CreateGroupRequest request) {
        User currentUser = getCurrentUser();
        
        SplitGroup group = new SplitGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCreatedBy(currentUser);
        
        // Add members
        List<User> members = request.getMemberEmails().stream()
            .map(email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email)))
            .collect(Collectors.toList());
        
        if (!members.contains(currentUser)) {
            members.add(currentUser);
        }
        
        group.setMembers(members);
        group = splitGroupRepository.save(group);
        
        return convertToGroupDTO(group);
    }

    public List<SplitGroupDTO> getUserGroups() {
        User currentUser = getCurrentUser();
        List<SplitGroup> groups = splitGroupRepository.findByMembersContaining(currentUser);
        return groups.stream().map(this::convertToGroupDTO).collect(Collectors.toList());
    }

    public SplitGroupDTO getGroup(Long groupId) {
        SplitGroup group = splitGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        return convertToGroupDTO(group);
    }

    public SplitExpenseDTO addExpense(Long groupId, CreateExpenseRequest request) {
        User currentUser = getCurrentUser();
        SplitGroup group = splitGroupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

        SplitExpense expense = new SplitExpense();
        expense.setGroup(group);
        expense.setPaidBy(currentUser);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setSplitType(SplitExpense.SplitType.valueOf(request.getSplitType()));
        expense.setExpenseDate(LocalDateTime.now());
        
        expense = splitExpenseRepository.save(expense);

        // Create splits
        if ("EQUAL".equals(request.getSplitType())) {
            createEqualSplits(expense, group.getMembers());
        } else {
            createCustomSplits(expense, request.getSplits());
        }

        return convertToExpenseDTO(expense);
    }

    public Page<SplitExpenseDTO> getGroupExpenses(Long groupId, Pageable pageable) {
        Page<SplitExpense> expenses = splitExpenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId, pageable);
        return expenses.map(this::convertToExpenseDTO);
    }

    public List<UserBalanceDTO> getGroupBalances(Long groupId) {
        // TODO: Implement balance calculation logic
        return List.of();
    }

    public void settleExpense(Long expenseId) {
        User currentUser = getCurrentUser();
        ExpenseSplit split = expenseSplitRepository.findByExpenseIdAndUser(expenseId, currentUser)
            .orElseThrow(() -> new RuntimeException("Split not found"));
        split.setIsPaid(true);
        expenseSplitRepository.save(split);
    }

    private void createEqualSplits(SplitExpense expense, List<User> members) {
        double splitAmount = expense.getAmount() / members.size();
        for (User member : members) {
            ExpenseSplit split = new ExpenseSplit();
            split.setExpense(expense);
            split.setUser(member);
            split.setAmount(splitAmount);
            split.setIsPaid(member.equals(expense.getPaidBy()));
            expenseSplitRepository.save(split);
        }
    }

    private void createCustomSplits(SplitExpense expense, List<ExpenseSplitRequest> splitRequests) {
        for (ExpenseSplitRequest splitRequest : splitRequests) {
            User user = userRepository.findByEmail(splitRequest.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            ExpenseSplit split = new ExpenseSplit();
            split.setExpense(expense);
            split.setUser(user);
            split.setAmount(splitRequest.getAmount());
            split.setIsPaid(user.equals(expense.getPaidBy()));
            expenseSplitRepository.save(split);
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private SplitGroupDTO convertToGroupDTO(SplitGroup group) {
        SplitGroupDTO dto = new SplitGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setCreatedBy(group.getCreatedBy().getDisplayName());
        dto.setMembers(group.getMembers().stream()
            .map(User::getDisplayName)
            .collect(Collectors.toList()));
        dto.setCreatedAt(group.getCreatedAt().toString());
        return dto;
    }

    private SplitExpenseDTO convertToExpenseDTO(SplitExpense expense) {
        SplitExpenseDTO dto = new SplitExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setPaidBy(expense.getPaidBy().getDisplayName());
        dto.setSplitType(expense.getSplitType().toString());
        dto.setExpenseDate(expense.getExpenseDate().toString());
        dto.setCreatedAt(expense.getCreatedAt().toString());
        return dto;
    }
}