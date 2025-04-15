import { useParams } from "react-router-dom";
import QuestionList from "../../../../../components/question/QuestionList";
import UserHeader from "../../../../../components/User/UserHeader";
import { useUser } from "../../../../../hooks/useUser";
import { Collection } from "../../../../../types/collection";
import React, { useEffect, useState } from "react";
import CollectionHeader from "../../../../../components/collection/CollectionHeader";
import { getCollection } from "../../../../../api/CollectionAPI";

interface QuestionPageProps {
  collection?: Collection;
}

const QuestionPage: React.FC<QuestionPageProps> = ({collection: propCollection}) => {
  const { userId, collectionId } = useParams<{ userId: string; collectionId: string }>();
  const { user, loading, errorMessage }= useUser(userId);
  const [collection, setCollection] = useState<Collection | undefined>(propCollection);

  useEffect(() => {
    const fetchCollectionSet = async () => {
      if (!collectionId) return;
      if (propCollection != null) {
        setCollection(propCollection);
        return;
      }

      const res = await getCollection(Number(collectionId));
      setCollection(res);
    };
    fetchCollectionSet();
  }, [collectionId, propCollection]);
  
  return (
    <div>
      <UserHeader user={user} loading={loading} errorMessage={errorMessage}/>
      <div>
        コレクション
        {collection && <CollectionHeader collection={collection} isOwner={user? user.self: false} />} 
      </div>
      <div>
        問題一覧
        <QuestionList collectionId={Number(collectionId)} userId={user?.id} isOwner={user? user.self : false} />
      </div> 
    </div>
  );
};

export default QuestionPage;
