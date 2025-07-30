package com.example.myapp.service;
import com.example.myapp.model.Collection;
import com.example.myapp.model.FavoriteCollection;
import com.example.myapp.model.User;
import com.example.myapp.repository.CollectionStatsRepository;
import com.example.myapp.repository.FavoriteCollectionRepository;
import com.example.myapp.util.PermissionCheck;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteCollectionService {
    private final FavoriteCollectionRepository favoriteCollectionRepository;
    private final CollectionStatsRepository collectionStatsRepository;


        public List<Collection> getFavoriteCollections(User user, User loginUser) {
            List<Collection> favoriteCollections = favoriteCollectionRepository.findByUserOrderByCreatedAtDesc(user)
                    .stream()
                    .map(FavoriteCollection::getCollection)
                    .collect(Collectors.toList());

            favoriteCollections = PermissionCheck.filterCollectionsByViewPermission(loginUser, favoriteCollections);
            return favoriteCollections;
        }
    
    @Transactional
    public void addFavorite(User user, Collection collection) {
        if (!favoriteCollectionRepository.existsByUserAndCollection(user, collection)) {
            FavoriteCollection favorite = new FavoriteCollection();
            favorite.setUser(user);
            favorite.setCollection(collection);
            favoriteCollectionRepository.save(favorite);
            collection.getCollectionStats().incrementFavoriteCount();
            collectionStatsRepository.save(collection.getCollectionStats());
        }
    }

    @Transactional
    public void removeFavorite(User user, Collection collection) {
        favoriteCollectionRepository.deleteByUserAndCollection(user, collection);
        collection.getCollectionStats().decrementFavoriteCount();
        collectionStatsRepository.save(collection.getCollectionStats());
    }

    public boolean favorite(User user, Collection collection) {
        return favoriteCollectionRepository.existsByUserAndCollection(user, collection);
    } 
}
