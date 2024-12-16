package com.dan.shoe.shoe.services;

import com.dan.shoe.shoe.models.User;

public interface EmailService {
    public void sendVerificationEmail(User user);
    public void sendForgotPasswordEmail(User user);
}
