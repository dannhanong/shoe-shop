package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private TemplateEngine templateEngine;
    @Value("${base.url}")
    private String baseUrl;

    @Override
    public void sendVerificationEmail(User user) {
        String toAddress = user.getEmail();
        String subject = "Hãy xác thực email của bạn";
        String senderName = "Shoe Shop";

        Map<String, Object> model = new HashMap<>();
        model.put("name", user.getName());
        model.put("verifyURL", baseUrl + "/auth/verify?code=" + user.getVerificationCode());

        Context context = new Context();
        context.setVariables(model);
        String content = templateEngine.process("verification-email", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = null;
        try {
            helper = new MimeMessageHelper(message, true);
            helper.setFrom("admin", senderName);
            helper.setTo(toAddress);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void sendForgotPasswordEmail(User user) {
        String toAddress = user.getEmail();
        String subject = "Email quên mật khẩu";
        String senderName = "Shoe Shop";

        Map<String, Object> model = new HashMap<>();
        model.put("name", user.getName());
        model.put("password", user.getPassword());

        Context context = new Context();
        context.setVariables(model);
        String content = templateEngine.process("forgot-pass-email", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = null;
        try {
            helper = new MimeMessageHelper(message, true);
            helper.setFrom("admin", senderName);
            helper.setTo(toAddress);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
