import React from "react";

const SecurityNotice: React.FC = () => (
  <div className="text-xs text-gray-500 bg-gray-100 p-4 rounded-md border border-gray-300">
    <p className="mb-2 font-semibold">※セキュリティに関するご注意</p>
    <ul className="list-disc pl-5 space-y-1 text-left">
      <li>このアプリは大学生が個人の学習目的で制作したものであり、商用サービスではありません。</li>
      <li>パスワードはハッシュ化して保存していますが、万全なセキュリティを保証するものではありません。</li>
      <li>他のサービスと同じパスワードの使い回しは<strong className="text-red-600">絶対にお控えください</strong>。</li>
      <li>アカウント名やクイズ内容に個人情報を含めないようご注意ください。</li>
      <li>このサービスはクイズアプリであり、金銭的な課金要素や重要情報は一切含まれません。</li>
    </ul>
  </div>
);

export default SecurityNotice;
