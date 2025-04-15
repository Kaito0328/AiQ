package com.example.myapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetInput;

@Entity
@Getter
@Setter
@Table(name = "collection_sets")
public class CollectionSet extends BaseTimeEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // コレクションセット名 (ユーザー名や分野など)
    private boolean open = false; // 公開か非公開かを設定

    @Column(columnDefinition = "TEXT", nullable = true)
    private String descriptionText;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // コレクションセットを作成したユーザー

    public CollectionSet() {}

    public CollectionSet(String name, User user) {
        this.name = name;
        this.user = user;
    }

    public CollectionSet(CollectionSetInput collectionSetInput, User user) {
        this.name = collectionSetInput.name();
        this.user = user;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true; // 同じ参照なら true
        if (obj == null || getClass() != obj.getClass())
            return false; // クラス違いなら false

        CollectionSet that = (CollectionSet) obj;
        return id != null && id.equals(that.id); // ID が等しければ true
    }

    @Override
    public int hashCode() {
        return id == null ? 0 : id.hashCode();
    }
}
