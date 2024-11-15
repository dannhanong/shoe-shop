package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.models.Voucher;

import java.util.List;

public interface VoucherService {
    Voucher createVoucher(Voucher voucher);
    Voucher updateVoucher(Long id, Voucher updatedVoucher);
    ResponseMessage deleteVoucher(Long id);
    Voucher validateVoucher(String code, User user);
    void decrementVoucherUsage(Voucher voucher);
    Voucher getVoucherById(Long id);
    List<Voucher> getActiveVouchers();
    void recordVoucherUsage(User user, Voucher voucher);
    boolean isVoucherUsedByUser(User user, Voucher voucher);
    Voucher getVoucherConsistent();
}
