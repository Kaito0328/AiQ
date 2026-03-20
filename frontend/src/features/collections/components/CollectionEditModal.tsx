"use client";
import { logger } from "@/src/shared/utils/logger";

import React, { useState } from "react";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Input } from "@/src/design/baseComponents/Input";
import { Select } from "@/src/design/baseComponents/Select";
import { Collection } from "@/src/entities/collection";
import { Checkbox } from "@/src/design/baseComponents/Checkbox";
import { TextArea } from "@/src/design/baseComponents/TextArea";
import { FormField } from "@/src/design/baseComponents/FormField";
import { View } from "@/src/design/primitives/View";
import { Modal } from "@/src/design/baseComponents/Modal";
import { Stack } from "@/src/design/primitives/Stack";
import AppConfig from "@/src/app_config";
import { useCollectionMutations } from "../hooks/useCollectionMutations";
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

interface CollectionEditModalProps {
  collection: Collection;
  onUpdated: (collection: Collection) => void;
  onCancel: () => void;
}

export function CollectionEditModal({
  collection,
  onUpdated,
  onCancel,
}: CollectionEditModalProps) {
  const { updateCollection: doUpdateCollection } = useCollectionMutations();
  const { showToast } = useToast();
  const [name, setName] = useState(collection.name);
  const [descriptionText, setDescriptionText] = useState(
    collection.descriptionText || "",
  );
  const [isOpen, setIsOpen] = useState(collection.isOpen);
  const [defaultMode, setDefaultMode] = useState<any>(
    collection.defaultMode || "omakase",
  );
  const [difficultyLevel, setDifficultyLevel] = useState<number>(
    collection.difficultyLevel ?? 3,
  );
  const [tagsText, setTagsText] = useState(
    (collection.tags || []).map((t) => `#${t}`).join(" "),
  );
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
      const shouldSendTags =
        tagsText.trim().length > 0 || (collection.tags?.length || 0) > 0;
      const updated = await doUpdateCollection(collection.id, {
        name: name.trim(),
        descriptionText: descriptionText.trim() || undefined,
        isOpen,
        defaultMode,
        difficultyLevel,
        tags: shouldSendTags ? tags : undefined,
      });
      showToast({ message: "コレクションを更新しました", variant: "success" });
      onUpdated(updated);
    } catch (err) {
      logger.error("コレクション更新に失敗", err);
      setError("更新に失敗しました");
      showToast({ message: "更新に失敗しました", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="コレクションの編集"
      size="md"
      centerTitle={true}
      footer={
        <Flex gap="sm" justify="center">
          <Button variant="outline" type="button" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "保存中..." : "変更を保存"}
          </Button>
        </Flex>
      }
    >
      <form onSubmit={handleSubmit} className="py-4">
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
              description="空白かカンマ区切り。最大10個、1タグ10文字です。"
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
