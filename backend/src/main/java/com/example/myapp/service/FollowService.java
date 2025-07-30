package com.example.myapp.service;

import com.example.myapp.dto.UserOutput;
import com.example.myapp.model.Follow;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import com.example.myapp.repository.FollowRepository;
import com.example.myapp.repository.UserStatsRepository;
import com.example.myapp.util.ListTransformUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final FollowRepository followRepository;
    private final UserStatsRepository userStatsRepository;

    public List<UserOutput> getFollowers(User user) {
        List<User> followers = followRepository.findByFolloweeOrderByCreatedAtDesc(user)
                .stream()
                .map(Follow::getFollower)
                .collect(Collectors.toList());
        return ListTransformUtil.toUserOutputs(followers);
    }

    public List<UserOutput> getFollowees(User user) {
        List<User> followees = followRepository.findByFollowerOrderByCreatedAtDesc(user)
                .stream()
                .map(Follow::getFollowee)
                .collect(Collectors.toList());
        return ListTransformUtil.toUserOutputs(followees);
    }

    @Transactional
    public void follow(User follower, User followee) {
        if (!followRepository.existsByFollowerAndFollowee(follower, followee)) {
            Follow follow = new Follow();
            follow.setFollower(follower);
            follow.setFollowee(followee);
            followRepository.save(follow);
            UserStats followerStats = follower.getUserStats();
            followerStats.incrementFollowingCount();
            UserStats followeeStats = followee.getUserStats();
            followeeStats.incrementFollowerCount();
            userStatsRepository.save(followerStats);
            userStatsRepository.save(followeeStats);

        }
    }

    @Transactional
    public void unfollow(User follower, User followee) {
        followRepository.deleteByFollowerAndFollowee(follower, followee);
        UserStats followerStats = follower.getUserStats();
        followerStats.decrementFollowingCount();
        UserStats followeeStats = followee.getUserStats();
        followeeStats.decrementFollowerCount();
        userStatsRepository.save(followerStats);
        userStatsRepository.save(followeeStats);
    }

    public boolean isFollowing(User user, User loginUser) {
        return followRepository.existsByFollowerAndFollowee(loginUser, user);
    }

    
    public boolean isFollowed(User user, User loginUser) {
        return followRepository.existsByFollowerAndFollowee(user, loginUser);
    }
}
