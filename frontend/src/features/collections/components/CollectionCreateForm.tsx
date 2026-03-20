"use client";
import React, { useState } from "react";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Input } from "@/src/design/baseComponents/Input";
import { X, FolderPlus } from "lucide-react";
import { Select } from "@/src/design/baseComponents/Select";
import { useCollectionMutations } from "../hooks/useCollectionMutations";
import { Collection } from "@/src/entities/collection";
import { Checkbox } from "@/src/design/baseComponents/Checkbox";
import { TextArea } from "@/src/design/baseComponents/TextArea";
import { FormField } from "@/src/design/baseComponents/FormField";
import { View } from "@/src/design/primitives/View";
import { Modal } from "@/src/design/baseComponents/Modal";
import AppConfig from "@/src/app_config";
import { DifficultyStarsInput } from "./DifficultyStarsInput";
import { useToast } from "@/src/shared/contexts/ToastContext";

const MAX_TAG_LENGTH = 10;
const MAX_TAGS = 10;

function parseTagInput(value: string): string[] {
  const tags: string[] = [];
  for (const part of value.split(/[\s,]+/)) {
    const cleaned = part.trim().replace(/^#+/, "").toLowerCase();
    if (!cleaned) continue;

    const normalized = cleaned.slice(0, MAX_TAG_LENGTH);
    if (!normalized) continue;
    if (!tags.includes(normalized)) {
      tags.push(normalized);
    }
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

interface CollectionCreateFormProps {
  onCreated: (collection: Collection) => void;
  onCancel: () => void;
}

export function CollectionCreateForm({
  onCreated,
  onCancel,
}: CollectionCreateFormProps) {
  const { createCollection } = useCollectionMutations();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [defaultMode, setDefaultMode] = useState<any>("omakase");
  const [tagsText, setTagsText] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("コレクション名は必須です");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tags = parseTagInput(tagsText);
      const collection = await createCollection({
        name: name.trim(),
        descriptionText: descriptionText.trim() || undefined,
        isOpen,
        defaultMode,
        difficultyLevel,
        tags,
      });
      showToast({ message: "コレクションを作成しました", variant: "success" });
      onCreated(collection);
    } catch (err) {
      setError("作成に失敗しました");
      showToast({ message: "作成に失敗しました", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="新規コレクション作成"
      size="md"
      footer={
        <Flex gap="sm" justify="end" className="w-full">
          <Button variant="ghost" type="button" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            variant="solid"
            color="primary"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "作成中..." : "作成"}
          </Button>
        </Flex>
      }
    >
      <form onSubmit={handleSubmit} className="py-2">
        <Stack gap="lg">
          <Stack gap="md">
            <FormField label="コレクション名 *" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 英語の基本単語"
                maxLength={AppConfig.collection.name_max_length}
                autoFocus
              />
            </FormField>

            <Flex gap="sm" align="center" className="flex-nowrap">
              <Text variant="xs" weight="bold" className="shrink-0">
                難易度
              </Text>
              <DifficultyStarsInput
                value={difficultyLevel}
                onChange={setDifficultyLevel}
              />
              <Text variant="xs" color="secondary" className="shrink-0">
                {difficultyLevel}/5
              </Text>
            </Flex>

            <FormField label="説明">
              <TextArea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="コレクションの内容について説明を入力してください"
                maxLength={AppConfig.collection.description_max_length}
              />
            </FormField>

            <View
              as="label"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox checked={isOpen} onChange={() => setIsOpen(!isOpen)} />
              <Stack gap="none">
                <Text variant="xs" weight="bold">
                  公開する
                </Text>
                <Text variant="xs" color="secondary" className="opacity-70">
                  このコレクションを他のユーザーからも見えるようにします
                </Text>
              </Stack>
            </View>

            <FormField
              label="推奨回答方式 (デフォルト)"
              description="※ コレクション全体で優先して使用する回答方式を選択してください。"
            >
              <Select
                value={defaultMode}
                onChange={(e) => setDefaultMode(e.target.value as any)}
              >
                <option value="omakase">おまかせ (AI搭載自動判定)</option>
                <option value="text">テキスト入力</option>
                <option value="fourChoice">4択</option>
                <option value="chips">文字チップ</option>
              </Select>
            </FormField>

            <FormField
              label="タグ"
              description="空白かカンマで区切って入力（最大10個、1タグ10文字）。"
            >
              <Input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="#英語 #TOEIC #中学"
              />
            </FormField>
          </Stack>

          {error && (
            <Text variant="xs" color="danger">
              {error}
            </Text>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
