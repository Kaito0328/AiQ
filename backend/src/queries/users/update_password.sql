-- IDを指定してパスワード(ハッシュ値)を更新する
UPDATE users
SET password = $1
WHERE id = $2