import Text from "../../../baseComponents/Text";

interface Props {
  description?: string;
}

const DescriptionText: React.FC<Props> = ({ description }) => (
    <Text
      text={description}
      emptyText="説明文はありません"
    />
);

export default DescriptionText;
