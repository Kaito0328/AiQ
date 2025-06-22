import { CoreColorKey } from "../../../../../style/colorStyle";
import { FontWeightKey } from "../../../../../style/fontWeight";
import { SizeKey } from "../../../../../style/size";
import BaseLabel from "../../../../baseComponents/BaseLabel";

interface Props {
  correctAnswer?: string;
}

const CorrectAnswerText: React.FC<Props> = ({ correctAnswer }) => (
  <div className="flex">
    <BaseLabel
      label={correctAnswer}
      style={{
        color: {
          colorKey: CoreColorKey.Success
        },
        size: {
          sizeKey: SizeKey.LG
        },
        fontWeightKey: FontWeightKey.Bold
      }}

    />
  </div>
);

export default CorrectAnswerText;
