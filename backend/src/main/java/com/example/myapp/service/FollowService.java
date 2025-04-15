package com.example.myapp.service;

import com.example.myapp.model.Follow;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import com.example.myapp.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final FollowRepository followRepository;

    public List<Follow> getFollowers(User user) {
        return followRepository.findByFolloweeOrderByCreatedAtDesc(user);
    }

    public List<Follow> getFollowees(User user) {
        return followRepository.findByFollowerOrderByCreatedAtDesc(user);
    }

    public void follow(User follower, UserStats followerStats, User followee, UserStats followeeStats) {
        if (!followRepository.existsByFollowerAndFollowee(follower, followee)) {
            Follow follow = new Follow();
            follow.setFollower(follower);
            follow.setFollowee(followee);
            followRepository.save(follow);
            followerStats.incrementFollowingCount();
            followeeStats.incrementFollowerCount();
        }
    }

    public void unfollow(User follower, UserStats followerStats, User followee, UserStats followeeStats) {
        followRepository.deleteByFollowerAndFollowee(follower, followee);
        followerStats.decrementFollowingCount();
        followeeStats.decrementFollowerCount();
    }
}
