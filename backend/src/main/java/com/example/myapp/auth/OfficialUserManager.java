package com.example.myapp.auth;

import com.example.myapp.model.User;
import com.example.myapp.service.UserService;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import org.springframework.stereotype.Component;

@Component
public class OfficialUserManager {

    private final UserService userService;

    private static User officialUser;
    private static Long officialUserId;

    private static final String OFFICIAL_USER_NAME = "official_user";

    public OfficialUserManager(UserService userService) {
        this.userService = userService;
    }

    public void initOfficialUser() {
        if (userService.alreadyExists(OFFICIAL_USER_NAME)) {
            officialUser = userService.getByUsername(OFFICIAL_USER_NAME);
        } else{
            officialUser = userService.registerUser(OFFICIAL_USER_NAME, null);
        }

        officialUserId = officialUser.getId();

    }

    public static User getOfficialUser() {
        if (officialUser == null) {
            throw new CustomException(ErrorCode.NOT_FOUND_USER);
        }
        return officialUser;
    }

    public static Long getOfficialUserId() {
        return officialUserId;
    }
}
