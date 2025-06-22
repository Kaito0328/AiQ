import { FontWeightKey } from "../../../style/fontWeight";
import BaseLabel, { LabelStyle } from "../../baseComponents/BaseLabel";
import InLineTextInput, { InLineInputStyle } from "../../baseComponents/InLineTextInput";

interface Props {
  defaultValue?: string;
  value?: string;
    placeholder?: string;
  onChange: (value: string) => void;
    label: string;
  style?: InLineInputStyle;
}

const labelWithInput: React.FC<Props> = ({
  defaultValue,
  value,
  onChange,
  placeholder = "",
  style,
  label,
}) => {

    const labelStyle: LabelStyle = {
      size: style?.size,
      color: {
        colorKey: style?.colorKey
      },
      roundKey: style?.roundKey,
      fontWeightKey: FontWeightKey.Semibold
    }
  return (
    <div>
        <BaseLabel
            label={label}
            style={labelStyle}
        />
        <InLineTextInput
            onChange={onChange}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            style={style}
        />
    </div>
  );
};

export default labelWithInput;

