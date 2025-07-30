import React, { useEffect, useRef, useState } from "react";
import BaseCard from "../../containerComponents/BaseCard";
import { SizeKey } from "../../../style/size";
import AnswerInput from "./AnswerInput";
import QuestionText from "./QuestionText";
import AnswerSubmitButton from "./AnswerSubmitButton";
import HintButton from "./hint/HintButton";
import HintDisplay from "./hint/HintDisplay";
import { RoundKey } from "../../../style/rounded";

interface Props {
  questionText: string;
  correctAnswer: string;
  onSubmitAnswer: (userAnswer: string) => void;
}

const QuizForm: React.FC<Props> = ({ questionText, correctAnswer, onSubmitAnswer }) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const skipNextSubmit = useRef(false);

  const handleHint = () => {
    if (hint.length < correctAnswer.length) {
      setHint((prev) => prev + correctAnswer[prev.length]);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = () => {
    onSubmitAnswer(userAnswer.trim());
    inputRef.current?.blur();
  };

  useEffect(() => {
    // Enter キーが押された直後にマウントされたなら、次の submit を無視する
    const handleInitialKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        skipNextSubmit.current = true;
      }
    };
    window.addEventListener("keydown", handleInitialKeyDown, { once: true });

    // 入力欄にフォーカス
    inputRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleInitialKeyDown);
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (skipNextSubmit.current) {
      skipNextSubmit.current = false; // フラグを戻す
      return;
    }

    handleSubmit();
  };

  return (
    <div>
      <BaseCard
        style={{
          size: { sizeKey: SizeKey.XL },
          roundKey: RoundKey.Lg,
        }}
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <QuestionText questionText={questionText} />
          <AnswerInput
            value={userAnswer}
            onChange={setUserAnswer}
            inputRef={inputRef}
          />

          <div className="min-h-[3rem]">
            <HintDisplay hint={hint} />
          </div>

          <div className="flex gap-10 justify-center">
            <HintButton onHint={handleHint} />
            <AnswerSubmitButton />
          </div>
        </form>
      </BaseCard>
    </div>
  );
};



export default QuizForm;
