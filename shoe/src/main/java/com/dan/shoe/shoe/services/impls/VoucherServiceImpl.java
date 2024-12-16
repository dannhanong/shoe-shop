package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.dtos.responses.VoucherResponse;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.Voucher;
import com.dan.shoe.shoe.models.VoucherUsage;
import com.dan.shoe.shoe.repositories.UserRepository;
import com.dan.shoe.shoe.repositories.VoucherRepository;
import com.dan.shoe.shoe.repositories.VoucherUsageRepository;
import com.dan.shoe.shoe.services.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VoucherServiceImpl implements VoucherService {
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private VoucherUsageRepository voucherUsageRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public Voucher createVoucher(Voucher voucher) {
        if (voucher.getDiscountAmount() > 100)
            voucher.setPercentage(true);
        else
            voucher.setPercentage(false);
        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher updateVoucher(Long id, Voucher updatedVoucher) {
        Voucher existingVoucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        existingVoucher.setCode(updatedVoucher.getCode());
        existingVoucher.setDiscountAmount(updatedVoucher.getDiscountAmount());
        existingVoucher.setMaxUsage(updatedVoucher.getMaxUsage());
        existingVoucher.setStartDate(updatedVoucher.getStartDate());
        existingVoucher.setEndDate(updatedVoucher.getEndDate());
        existingVoucher.setActive(updatedVoucher.isActive());

        if (updatedVoucher.getDiscountAmount() > 100)
            existingVoucher.setPercentage(true);
        else
            existingVoucher.setPercentage(false);

        return voucherRepository.save(existingVoucher);
    }

    @Override
    public ResponseMessage deleteVoucher(Long id) {
        return voucherRepository.findById(id)
                .map(voucher -> {
                    voucherRepository.delete(voucher);
                    return new ResponseMessage(200, "Xoá voucher thành công");
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
    }

    @Override
    public Voucher validateVoucher(String code, User user) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found or invalid"));

        if (!voucher.isValid()) {
            throw new RuntimeException("Voucher is not valid for use");
        }

        // Kiểm tra nếu người dùng đã sử dụng voucher này trước đó
        if (voucherUsageRepository.existsByUserAndVoucher(user, voucher)) {
            throw new RuntimeException("User has already used this voucher");
        }

        return voucher;
    }

    @Override
    public void decrementVoucherUsage(Voucher voucher) {
        voucher.setMaxUsage(voucher.getMaxUsage() - 1);
        voucherRepository.save(voucher);
    }

    @Override
    public void recordVoucherUsage(User user, Voucher voucher) {
        VoucherUsage usage = VoucherUsage.builder()
                .user(user)
                .voucher(voucher)
                .usedAt(LocalDateTime.now())
                .build();
        voucherUsageRepository.save(usage);
    }

    @Override
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
    }

    @Override
    public List<Voucher> getActiveVouchers() {
        return voucherRepository.findByActiveTrueAndStartDateBeforeAndEndDateAfter(LocalDate.now().plusDays(1), LocalDate.now());
    }

    @Override
    public boolean isVoucherUsedByUser(User user, Voucher voucher) {
        return voucherUsageRepository.existsByUserAndVoucher(user, voucher);
    }

    @Override
    public Voucher getVoucherConsistent() {
        return voucherRepository.findTopByActiveTrueAndStartDateBeforeAndEndDateAfterAndMaxUsageGreaterThanOrderByDiscountAmountDesc
                        (LocalDate.now().plusDays(1), LocalDate.now(), 0);
    }

    @Override
    public List<VoucherResponse> getVouchersActiveHasStatusByUser(String username) {
        User user = userRepository.findByUsername(username);
        return voucherRepository.findByActiveTrueAndStartDateBeforeAndEndDateAfter(LocalDate.now().plusDays(1), LocalDate.now())
                .stream()
                .map(voucher -> {
                    boolean used = voucherUsageRepository.existsByUserAndVoucher(user, voucher);
                    return VoucherResponse.builder()
                            .id(voucher.getId())
                            .code(voucher.getCode())
                            .discountAmount(voucher.getDiscountAmount())
                            .percentage(voucher.isPercentage())
                            .maxUsage(voucher.getMaxUsage())
                            .startDate(voucher.getStartDate())
                            .endDate(voucher.getEndDate())
                            .active(voucher.isActive())
                            .used(used)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<Voucher> getAllVouchers(String keyword, String status, Pageable pageable) {
        Page<Voucher> vouchers = voucherRepository.findByCodeContaining(keyword, pageable);
        if (status.isEmpty()) {
            return vouchers;
        }
        boolean active = status.equalsIgnoreCase("true");
        if (active) {
            List<Voucher> filteredVouchers = vouchers.stream()
                    .filter(Voucher::isValid)
                    .collect(Collectors.toList());
            return new PageImpl<>(filteredVouchers, pageable, filteredVouchers.size());
        } else {
            List<Voucher> filteredVouchers = vouchers.stream()
                    .filter(voucher -> !voucher.isValid())
                    .collect(Collectors.toList());
            return new PageImpl<>(filteredVouchers, pageable, filteredVouchers.size());
        }
    }
}
