package com.example.myapp.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.example.myapp.dto.Item.Collection.CollectionInput;

@Entity
@Getter
@Setter
@Table(name = "collections")
public class Collection extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean open;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String descriptionText;

    @ManyToOne
    @JoinColumn(name = "collectionSetId", nullable = false)
    private CollectionSet collectionSet;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "collection_stats_id", nullable = false)
    private CollectionStats collectionStats;

    public Collection() {}

    public Collection(String name, boolean open, CollectionSet collectionSet) {
        this.name = name;
        this.open = open;
        this.collectionSet = collectionSet;
    }

    public Collection(CollectionInput collectionInput, CollectionSet collectionSet) {
        this.name = collectionInput.name();
        this.open = collectionInput.open();
        this.collectionSet = collectionSet;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;

        Collection that = (Collection) obj;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id == null ? 0 : id.hashCode();
    }
}
