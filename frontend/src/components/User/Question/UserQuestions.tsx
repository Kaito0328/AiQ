// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import UserHeader from "../UserHeader";
// import { getQuestionsByCollectionId, updateQuestion } from "../../../api/QuestionAPI";
// import { getUserById } from "../../../api/UserAPI";
// import { FaEye, FaEyeSlash, FaSave, FaPlus, FaRobot, FaFileCsv } from "react-icons/fa";
// import { data } from "framer-motion/client";
// import CSVModal from "./CSVModal";
// import AIModal from "./AIModal";
// import { motion } from "framer-motion";
// import QuestionList from "./QuestionList";
// import NewQuestionForm from "./NewQuestionForm";
// import { User } from "../../../types/user";

// const UserQuestions: React.FC = () => {
//   const { userId, collectionId } = useParams<{ userId: string; collectionId: string }>();
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [editedQuestions, setEditedQuestions] = useState<{ [key: number]: Partial<Question> }>({});
//   const [newQuestions, setNewQuestions] = useState<CreateQuestionRequest[]>([]);
//   const [showAnswers, setShowAnswers] = useState<boolean[]>([]);
//   const [allAnswersVisible, setAllAnswersVisible] = useState(false);
//   const [user, setUser] = useState<User | null>(null);
//   const [isEditMode, setIsEditMode] = useState<boolean>(false); // 編集モードの管理
//   const [isSelfUser, setIsSelfUser] = useState<boolean>(false); // 自分のユーザーか判定
//   const [saveFailed, setSaveFailed] = useState<boolean>(false);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
  
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const data = await getUserById(Number(userId));
//         setUser(data);
//       } catch (error) {
//         console.error("ユーザー情報の取得に失敗しました:", error);
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   useEffect(() => {
//     if (user) setIsSelfUser(user.self);
//   }, [user])

//   const fetchQuestions = async () => {
//     if (!collectionId) return;
//     try {
//       const data = await getQuestionsByCollectionId(Number(collectionId));
//       setQuestions(data);
//       setShowAnswers(new Array(data.length).fill(false));
//     } catch (error) {
//       console.error("問題の取得に失敗しました:", error);
//     }
//   };

//   useEffect(() => {
//     fetchQuestions();
//   }, [collectionId]);

//   const toggleAnswer = (index: number) => {
//     setShowAnswers(prev => prev.map((val, i) => (i === index ? !val : val)));
//   };

//   const toggleAllAnswers = () => {
//     const newState = !allAnswersVisible;
//     setShowAnswers(new Array(questions.length).fill(newState));
//     setAllAnswersVisible(newState);
//   };

//   const handleSolve = () => {
//     navigate("/questions", {
//       state: { 
//         selectedCollections: [Number(collectionId)], 
//         questionOrder: "asc", 
//         questionCount: questions.length 
//       },
//     });
//   };

//   const handleInputChange = (questionId: number, field: keyof Question, value: string) => {
//     setEditedQuestions(prev => ({
//       ...prev,
//       [questionId]: {
//         ...prev[questionId],
//         [field]: value,
//       },
//     }));
//   };

//   const saveNewQuestions = async () => {
//     const validQuestions = newQuestions.filter(
//       (question) => question.questionText.trim() !== "" && question.correctAnswer.trim() !== ""
//     );
  
//     // 未入力の項目があった場合、エラーメッセージを表示
//     if (validQuestions.length < newQuestions.length) {
//       setMessage("問題と解答が入力されていない箇所があります。入力してください。");
//       setSaveFailed(true);
//       return;
//     }
  
//     // バックエンドに送信
//     if (validQuestions.length > 0) {
//       try {
//         await createQuestions(Number(collectionId), validQuestions); // ここで送信する関数に適宜変更してください
//         setNewQuestions([]);
//         setMessage("新しい問題が保存されました！");
//       } catch (error) {
//         console.error("保存に失敗しました:", error);
//         setMessage("保存に失敗しました。");
//       }
//     }
//   };

//   const saveEditedQuestions = async () => {
//     const updates = Object.entries(editedQuestions).map(([id, changes]) => ({
//       id: Number(id),
//       ...changes,
//     }));

//     const validUpdates = updates.filter(
//       (question) => !(question.questionText && question.questionText.trim() === "") && !(question.correctAnswer && question.correctAnswer.trim() === "")
//     );
  
//     // 未入力の項目があった場合、エラーメッセージを表示
//     if (validUpdates.length < updates.length) {
//       setMessage("問題と解答が入力されていない箇所があります。入力してください。");
//       setSaveFailed(true);
//       return;
//     }
  
//     // バックエンドに送信
//     if (validUpdates.length > 0) {
//       try {
//         await updateQuestion(validUpdates);
//         setEditedQuestions([]);
//         alert("変更が保存されました！");
//       } catch (error) {
//         console.error("保存に失敗しました", error);
//         alert("保存に失敗しました");
//       }
//     }

//   };

//   const handleSaveChanges = async () => {
//     try {
//       await saveEditedQuestions();
//       await saveNewQuestions();
//       await fetchQuestions();
//     } catch (error) {
//       console.error("保存に失敗しました", error);
//     }
//   };

//   const toggleEditMode = () => {
//     setIsEditMode((prev) => !prev); // 編集モードを切り替え
//   };

//   const handleAddQuestion = () => {
//     setNewQuestions(prevnewQuestions => [
//       ...prevnewQuestions,
//       {questionText: "", correctAnswer: "", descriptionText: "" }
//     ])
//   };
//   const [modalType, setModalType] = useState<'csv' | 'ai' | null>(null);

//     const [isExpanded, setIsExpanded] = useState(false);

//   const toggleMenu = () => setIsExpanded(!isExpanded);

//   const openModal = (type: "csv" | "ai") => {
//     setIsExpanded(false); // 選択肢を閉じる
//     setTimeout(() => setModalType(type), 300); // アニメーション後にモーダルを開く
//   };

//   const closeModal = () => setModalType(null);

//   const onComplete = () => {
//     setModalType(null);
//     fetchQuestions();
//   }
  
  

//   return (
//     <div className="min-h-screen">
//       <UserHeader user={user} />

//       <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-semibold text-gray-800">Questions in Collection</h2>
//           <button
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
//             onClick={handleSolve}
//           >
//             この問題を解く 🚀
//           </button>
//         </div>

//         <div className="flex justify-between mb-4">
//           {isEditMode && user && user.self && (
//             <button
//               className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition flex items-center space-x-2"
//               onClick={handleSaveChanges}
//             >
//               <FaSave />
//               <span>変更を保存</span>
//             </button>
//           )}
//           {questions.length > 0 && (
//             <button
//               className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
//               onClick={toggleAllAnswers}
//             >
//               {allAnswersVisible ? "すべての答えを隠す" : "すべての答えを表示"}
//             </button>
//           )}
//         </div>

//         {questions.length === 0 && newQuestions.length === 0? (
//           <p className="text-gray-500 text-center w-full">問題がありません</p>
//         ) : (
//           <ul className="space-y-4">
//             {questions.map((question, index) => (
//               <li key={question.id} className="p-5 bg-white rounded-lg shadow-md border-l-4 border-blue-500 relative">
//                 <div className="flex justify-between items-center">
//                   <input
//                     type="text"
//                     className="border p-2 w-full rounded-lg text-lg"
//                     value={editedQuestions[question.id]?.questionText ?? question.questionText}
//                     onChange={(e) => handleInputChange(question.id, "questionText", e.target.value)}
//                     disabled={!isSelfUser || !isEditMode}
//                   />
//                   {/* 問題が空の場合にエラーメッセージを表示 */}
//                   {question.questionText.trim() === "" && saveFailed && (
//                     <p className="text-red-500 text-xs absolute right-2 bottom-1">入力してください</p>
//                   )}
//                 </div>
//                 <span className="absolute bottom-2 right-2 text-xs text-gray-500 z-10">
//                   ID: {question.id}
//                 </span>

//                 <button
//                   className="mt-2 text-blue-500 flex items-center space-x-2 hover:text-blue-700 transition"
//                   onClick={() => toggleAnswer(index)}
//                 >
//                   {showAnswers[index] ? <FaEyeSlash /> : <FaEye />}
//                   <span>{showAnswers[index] ? "答えを隠す" : "答えを見る"}</span>
//                 </button>

//                 {showAnswers[index] && (
//                   <div>
//                     <div>
//                       <input
//                         type="text"
//                         className="border p-2 w-full rounded-lg text-lg mt-3 bg-green-100 text-green-700"
//                         value={editedQuestions[question.id]?.correctAnswer ?? question.correctAnswer}
//                         onChange={(e) => handleInputChange(question.id, "correctAnswer", e.target.value)}
//                         disabled={!(user && user.self) || !isEditMode}
//                       />
//                       {/* 問題が空の場合にエラーメッセージを表示 */}
//                       {question.questionText.trim() === "" && saveFailed && (
//                         <p className="text-red-500 text-xs absolute right-2 bottom-1">入力してください</p>
//                       )}
//                     </div>
//                     {question.descriptionText && (
//                       <textarea
//                       className="border p-2 w-full rounded-lg text-lg mt-3"
//                       value={editedQuestions[question.id]?.descriptionText ?? question.descriptionText}
//                       onChange={(e) => handleInputChange(question.id, "descriptionText", e.target.value)}
//                       disabled={!(user && user.self) || !isEditMode}
//                     />
//                     )}
//                   </div>

//                 )}
//               </li>
//             ))}
//           </ul>
//         )}

//       <div>
//           <ul className="space-y-4">
//             {newQuestions.map((newQuestion, index) => (
//               <li key={index} className="p-5 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
//                 <div className="flex justify-between items-center">
//                   <input
//                     type="text"
//                     className="border p-2 w-full rounded-lg text-lg"
//                     value={newQuestion.questionText}
//                     onChange={(e) =>
//                       setNewQuestions(prevNewQuestions => {
//                         const updatedQuestions = [...prevNewQuestions];
//                         updatedQuestions[index].questionText = e.target.value;
//                         return updatedQuestions;
//                       })
//                     }
//                     placeholder="問題文を入力"
//                   />
//                   {/* 問題が空の場合にエラーメッセージを表示 */}
//                   {newQuestion.questionText.trim() === "" && saveFailed && (
//                     <p className="text-red-500 text-xs absolute right-2 bottom-1">入力してください</p>
//                   )}
//                 </div>
//                 <div>
//                   <input
//                     type="text"
//                     className="border p-2 w-full rounded-lg text-lg mt-3"
//                     value={newQuestion.correctAnswer}
//                     onChange={(e) =>
//                       setNewQuestions(prevNewQuestions => {
//                         const updatedQuestions = [...prevNewQuestions];
//                         updatedQuestions[index].correctAnswer = e.target.value;
//                         return updatedQuestions;
//                       })
//                     }
//                     placeholder="答えを入力"
//                   />
//                   {/* 問題が空の場合にエラーメッセージを表示 */}
//                   {newQuestion.correctAnswer.trim() === "" && saveFailed && (
//                     <p className="text-red-500 text-xs absolute right-2 bottom-1">入力してください</p>
//                   )}
//                 </div>
//                 <textarea
//                   className="border p-2 w-full rounded-lg text-lg mt-3"
//                   value={newQuestion.descriptionText}
//                   onChange={(e) =>
//                     setNewQuestions(prevNewQuestions => {
//                       const updatedQuestions = [...prevNewQuestions];
//                       updatedQuestions[index].descriptionText = e.target.value;
//                       return updatedQuestions;
//                     })
//                   }
//                   placeholder="説明を入力"
//                 />
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* 編集モードボタン */}
//         {!isEditMode && user && user.self && (
//           <div className="fixed bottom-10 right-10 space-y-2">
//             <button
//               className="px-6 py-2 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition"
//               onClick={toggleEditMode}
//             >
//               編集モードに切替
//             </button>
//           </div>
//         )}

//         {/* 編集モード解除ボタン */}
//         {isEditMode && user && user.self && (
//           <div className="fixed bottom-10 right-10 space-y-2">
//             <button
//               className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
//               onClick={toggleEditMode}
//             >
//               編集モードを終了
//             </button>
//           </div>
//         )}

//         {/* 問題追加ボタン */}
//         {isEditMode && user && user.self && (
//           <div className="fixed bottom-24 right-10 space-y-2">
//             <button
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center space-x-2"
//               onClick={handleAddQuestion}
//             >
//               <FaPlus />
//               <span>問題を追加</span>
//             </button>
//           </div>
//         )}
//       </div>
//       <div>
//       {/* フローティングボタン */}
//       <div className="fixed bottom-6 left-6">
//         {/* 選択肢ボタン（CSV / AI） */}
//         {isExpanded && (
//           <>
//             <motion.button
//               initial={{ opacity: 0, x: 0, y: 0 }}
//               animate={{ opacity: 1, x: 100, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="absolute bg-blue-500 text-white p-3 rounded-full shadow-lg"
//               onClick={() => openModal("ai")}
//             >
//               <FaRobot />
//               <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm bg-gray-700 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 AIによる問題生成
//               </span>
//             </motion.button>

//             <motion.button
//               initial={{ opacity: 0, x: 0, y: 0 }}
//               animate={{ opacity: 1, x: 70, y: -70 }}
//               exit={{ opacity: 0 }}
//               className="absolute bg-green-500 text-white p-3 rounded-full shadow-lg"
//               onClick={() => openModal("csv")}
//             >
//               <FaFileCsv />
//               <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm bg-gray-700 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 CSVファイルアップロード
//               </span>
//             </motion.button>
//           </>
//         )}

//         {/* プラスボタン */}
//         <button
//           className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
//           onClick={toggleMenu}
//         >
//         <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm bg-gray-700 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 CSVファイルアップロード
//         </span>
//           <FaPlus />
//         </button>
//       </div>

//       {/* モーダル表示 */}
//       {modalType === "csv" && <CSVModal onClose={closeModal} onComplete={onComplete} collectionId={Number(collectionId)}/>}
//       {modalType === "ai" && <AIModal onClose={closeModal} onComplete={onComplete} collectionId={Number(collectionId)}/>}
//     </div>
//     </div>
    
//   );
// };

// export default UserQuestions;
