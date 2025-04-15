const saveAnswer = async (questionId: number, userAnswer: string) => {
    const token = localStorage.getItem("token");
  
    const response = await fetch("http://localhost:8080/api/answers/save", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ questionId, userAnswer })
    });
  
    if (response.ok) {
      console.log("回答を保存しました");
    } else {
      console.error("保存に失敗しました");
    }
  };
  
export default saveAnswer;