// import React from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { Question } from "../../../types/question";

// type QuestionListProps = {
//   questions: Question[];
//   editedQuestions: { [key: number]: Partial<Question> };
//   setEditedQuestions: React.Dispatch<React.SetStateAction<{ [key: number]: Partial<Question> }>>;
//   isSelfUser: boolean;
//   isEditMode: boolean;
// };

// const QuestionList: React.FC<QuestionListProps> = ({ questions, editedQuestions, setEditedQuestions, isSelfUser, isEditMode }) => {
//   const handleInputChange = (questionId: number, field: keyof Question, value: string) => {
//     setEditedQuestions(prev => ({
//       ...prev,
//       [questionId]: {
//         ...prev[questionId],
//         [field]: value,
//       },
//     }));
//   };

//   return (
//     <div>
//       <ul className="space-y-4">
//         {questions.map((question) => (
//           <li key={question.id} className="p-5 bg-white rounded-lg shadow-md border-l-4 border-blue-500 relative">
//             <div className="flex justify-between items-center">
//               <input
//                 type="text"
//                 className="border p-2 w-full rounded-lg text-lg"
//                 value={editedQuestions[question.id ]?.questionText ?? question.questionText}
//                 onChange={(e) => handleInputChange(question.id, "questionText", e.target.value)}
//                 disabled={!isSelfUser || !isEditMode}
//               />
//               {!question.questionText || question.questionText.trim() === "" && (
//                 <p className="text-red-500 text-xs absolute right-2 bottom-1">入力してください</p>
//               )}
//             </div>
//             <span className="absolute bottom-2 right-2 text-xs text-gray-500 z-10">
//               ID: {question.id}
//             </span>

//             {/* 解答表示/非表示 */}
//             <div>
//               <button
//                 className="mt-2 text-blue-500 flex items-center space-x-2 hover:text-blue-700 transition"
//                 onClick={() => {/* toggle answer logic */}}
//               >
//                 <FaEyeSlash />
//                 <span>答えを隠す</span>
//               </button>
//               {/* 省略: 答えの表示部分 */}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default QuestionList;
