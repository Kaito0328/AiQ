import CollectionSetList from "./../../../components/collectionSet/CollectionSetList";
import { useUser } from "../../../hooks/useUser";
import UserHeader from "../../../components/User/UserHeader";
import { useParams } from "react-router-dom";

const CollectionSetPage: React.FC = () => {
    const { userId } = useParams();
  const { user, loading, errorMessage }= useUser(userId);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <UserHeader user={user} loading={loading} errorMessage={errorMessage}/>
      {user && (
        <>
          <h2 className="text-2xl font-bold mb-4 mt-4">コレクションセット一覧</h2>
          <CollectionSetList 
            userId={Number(user.id)}
            isOwner={user.self}
          />
        </>
      )}
    </div>
  );
};

export default CollectionSetPage;
