"use client";

import React, { useState } from 'react';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Label } from '@/src/design/baseComponents/Label';
import { Input } from '@/src/design/baseComponents/Input';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';
import { Range } from '@/src/design/baseComponents/Range';
import { Button } from '@/src/design/baseComponents/Button';
import { IconButton } from '@/src/design/baseComponents/IconButton';
import { Badge } from '@/src/design/baseComponents/Badge';
import { Card } from '@/src/design/baseComponents/Card';
import { Divider } from '@/src/design/baseComponents/Divider';
import { Select } from '@/src/design/baseComponents/Select';
import { Switch } from '@/src/design/baseComponents/Switch';
import { Skeleton } from '@/src/design/baseComponents/Skeleton';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Container } from '@/src/design/primitives/Container';
import { Grid } from '@/src/design/primitives/Grid';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Breadcrumbs } from '@/src/design/baseComponents/Breadcrumbs';
import { Tabs } from '@/src/design/baseComponents/Tabs';
import { Tooltip } from '@/src/design/baseComponents/Tooltip';
import { Spinner, LoadingDots } from '@/src/design/baseComponents/Spinner';
import { Drawer } from '@/src/design/baseComponents/Drawer';
import { useTheme } from '@/src/shared/contexts/ThemeContext';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { cn } from '@/src/shared/utils/cn';
import { SurfaceColorKey, BrandColorKey } from '@/src/design/tokens/keys';
import { Home, User, Settings, Info, Bell, Search, Star } from 'lucide-react';

/**
 * AiQ デザインシステム・カタログ
 */
export default function DesignExamplePage() {
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const isDarkMode = theme === 'dark';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const addToast = (variant: BrandColorKey) => {
        showToast({
            message: `${variant} の通知内容です`,
            variant,
            description: "システムの実行結果をお知らせします。"
        });
    };

    return (
        <View bg="base" className="min-h-screen transition-colors duration-300 p-4 sm:p-8 md:p-12 overflow-x-hidden">
            <Stack gap="xl" className="max-w-6xl mx-auto">
                {/* ヘッダー */}
                <Flex justify="between" align="center" wrap gap="md">
                    <Stack gap="xs">
                        <Text variant="h1" color="primary">AiQ Design System</Text>
                        <Text variant="body" color="muted">コンポーネント・カタログ & ガイドライン</Text>
                    </Stack>
                    <Flex gap="sm" align="center" className="bg-surface-muted p-2 rounded-full shadow-sm">
                        <Text variant="xs" weight="bold">ライト</Text>
                        <Switch checked={isDarkMode} onChange={toggleTheme} />
                        <Text variant="xs" weight="bold">ダーク</Text>
                    </Flex>
                </Flex>

                <Divider />

                {/* 0. Navigation */}
                <CatalogSection title="0. ナビゲーション (Navigation)" description="階層移動やページ内切替に使用します。">
                    <Stack gap="lg">
                        <ComponentPreview title="Mobile Menu Pattern (Drawer)" description="ハンバーガーメニューの基盤です。">
                            <Flex gap="sm" align="center">
                                <IconButton
                                    icon={<Info size={20} />}
                                    color="primary"
                                    onClick={() => setIsDrawerOpen(true)}
                                />
                                <Text variant="detail">ボタンを押して Drawer を開く</Text>
                            </Flex>
                            <Drawer
                                isOpen={isDrawerOpen}
                                onClose={() => setIsDrawerOpen(false)}
                                title="ナビゲーション"
                            >
                                <Stack gap="md">
                                    <Button variant="ghost" className="justify-start">ホーム</Button>
                                    <Button variant="ghost" className="justify-start">プロジェクト</Button>
                                    <Button variant="ghost" className="justify-start">設定</Button>
                                </Stack>
                            </Drawer>
                        </ComponentPreview>
                        <ComponentPreview title="Breadcrumbs (パンくずリスト)">
                            <Breadcrumbs
                                items={[
                                    { label: 'ホーム', href: '#', icon: <Home size={14} /> },
                                    { label: '設定', href: '#' },
                                    { label: 'プロフィール' },
                                ]}
                            />
                        </ComponentPreview>
                        <ComponentPreview title="Tabs (タブ)">
                            <Tabs
                                items={[
                                    { id: '1', label: '基本情報', icon: <User size={16} />, content: <View padding="md" bg="muted" rounded="md">ユーザー情報を表示します。</View> },
                                    { id: '2', label: '通知設定', icon: <Bell size={16} />, content: <View padding="md" bg="muted" rounded="md">通知の受け取り方を設定します。</View> },
                                    { id: '3', label: 'セキュリティ', icon: <Settings size={16} />, content: <View padding="md" bg="muted" rounded="md">セキュリティ設定を行います。</View> },
                                ]}
                            />
                        </ComponentPreview>
                    </Stack>
                </CatalogSection>

                {/* 1. Tokens: Colors */}
                <CatalogSection title="1. デザイン・トークン (Colors)" description="システムの基盤となる色定義です。">
                    <Stack gap="lg">
                        <Stack gap="sm">
                            <Text weight="bold">ブランドカラー (Brand Colors)</Text>
                            <Flex gap="md" wrap>
                                <ColorBox label="Primary" color="primary" />
                                <ColorBox label="Secondary" color="secondary" />
                                <ColorBox label="Danger" color="danger" />
                                <ColorBox label="Success" color="success" />
                                <ColorBox label="Warning" color="warning" />
                                <ColorBox label="Info" color="info" />
                                <ColorBox label="Heart" color="heart" />
                            </Flex>
                        </Stack>
                        <Stack gap="sm">
                            <Text weight="bold">サーフェスカラー (Surface Colors)</Text>
                            <Flex gap="md" wrap>
                                <ColorBox label="Base" color="base" border />
                                <ColorBox label="Muted" color="muted" border />
                                <ColorBox label="Card" color="card" border />
                            </Flex>
                        </Stack>
                    </Stack>
                </CatalogSection>

                {/* 2. Primitives */}
                <CatalogSection title="2. プリミティブ (Primitives)" description="基本となるレイアウト・ビルディングブロックです。">
                    <Stack gap="md">
                        <View bg="muted" padding="md" rounded="md">
                            <Text weight="bold">View / Stack / Flex / Grid / Container</Text>
                            <Text variant="detail" color="muted" className="mb-4">宣言的にレイアウトを構成します。</Text>
                            <Container size="full" className="space-y-4">
                                <Stack gap="sm" className="bg-surface-base p-4 rounded border">
                                    <Text variant="detail" weight="bold">Grid Layout (3 columns)</Text>
                                    <Grid cols={3} gap="sm">
                                        <View bg="primary" padding="xs" rounded="sm" className="h-10" />
                                        <View bg="secondary" padding="xs" rounded="sm" className="h-10" />
                                        <View bg="primary" padding="xs" rounded="sm" className="h-10" />
                                    </Grid>
                                </Stack>
                                <Stack gap="sm" className="bg-surface-base p-4 rounded border">
                                    <Flex justify="between" className="border-b pb-2">
                                        <Text variant="detail">Flex: Between</Text>
                                        <Badge>Status</Badge>
                                    </Flex>
                                    <Stack gap="xs">
                                        <Text variant="detail">Stack: Content Group</Text>
                                        <Skeleton className="h-4 w-1/2" />
                                    </Stack>
                                </Stack>
                            </Container>
                        </View>
                    </Stack>
                </CatalogSection>

                {/* 3. Base Components */}
                <CatalogSection title="3. ベースコンポーネント (Base Components)" description="再利用可能な最小単位の UI コンポーネントです。">
                    <Stack gap="xl">
                        {/* Buttons */}
                        <ComponentPreview title="Button (ボタン)" description="様々なアクションをトリガーします。">
                            <Stack gap="md">
                                <Flex gap="sm" wrap align="center">
                                    <Button variant="solid" color="primary">Solid Primary</Button>
                                    <Button variant="outline" color="primary">Outline</Button>
                                    <Button variant="ghost" color="primary">Ghost</Button>
                                </Flex>
                                <Flex gap="sm" wrap align="center">
                                    <Button color="secondary">Secondary</Button>
                                    <Button color="danger">Danger</Button>
                                    <Button color="success">Success</Button>
                                    <Button color="warning">Warning</Button>
                                    <Button color="info">Info</Button>
                                </Flex>
                                <Flex gap="sm" align="center">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                    <IconButton icon={<span>❤</span>} color="heart" />
                                </Flex>
                            </Stack>
                        </ComponentPreview>

                        {/* Badges & Labels */}
                        <ComponentPreview title="Badge & Label (バッジとラベル)" description="ステータス表示やタグ付けに使用します。">
                            <Flex gap="md" wrap align="center">
                                <Badge variant="primary">新着</Badge>
                                <Badge variant="danger">エラー</Badge>
                                <Badge variant="success">完了</Badge>
                                <Badge variant="warning">待機中</Badge>
                                <Badge variant="info">情報</Badge>
                                <Divider orientation="vertical" className="h-6" />
                                <Label label="ユーザー" icon={<span>👤</span>} bg="muted" />
                                <Label label="重要" bg="danger" />
                            </Flex>
                        </ComponentPreview>

                        {/* Input & Form */}
                        <ComponentPreview title="Form Elements & FormField" description="ユーザー入力を受け付け、構造化します。">
                            <Stack gap="lg" className="max-w-md">
                                <FormField
                                    label="メールアドレス"
                                    description="ログインに使用するアドレスを入力してください。"
                                    required
                                >
                                    <Input placeholder="example@aiq.com" />
                                </FormField>

                                <FormField
                                    label="パスワード"
                                    error="パスワードが短すぎます。"
                                >
                                    <Input type="password" placeholder="••••••••" />
                                </FormField>

                                <FormField label="カテゴリ選択">
                                    <Select>
                                        <option>選択肢を選択してください</option>
                                        <option>オプション A</option>
                                        <option>オプション B</option>
                                    </Select>
                                </FormField>

                                <Flex gap="xl">
                                    <Checkbox label="利用規約に同意" defaultChecked />
                                    <Flex align="center" gap="sm">
                                        <Text variant="detail">通知設定</Text>
                                        <Switch defaultChecked />
                                    </Flex>
                                </Flex>
                                <FormField label="満足度スコア">
                                    <Range defaultValue={75} variant="primary" />
                                </FormField>
                            </Stack>
                        </ComponentPreview>

                        {/* Card & Divider */}
                        <ComponentPreview title="Layout Elements (レイアウト要素)" description="情報を構造化・分離します。">
                            <Flex gap="md" wrap>
                                <Card padding="md" className="flex-1 min-w-[200px]">
                                    <Text weight="bold">Card Title</Text>
                                    <Divider className="my-2" />
                                    <Text variant="detail" color="muted">カードは情報をグループ化し、浮き上がらせるために使用します。</Text>
                                </Card>
                                <Card bg="muted" padding="md" className="flex-1 min-w-[200px]">
                                    <Text weight="bold">Muted Card</Text>
                                    <Text variant="detail" color="muted" className="mt-2">背景色を変更することも可能です。</Text>
                                </Card>
                            </Flex>
                        </ComponentPreview>
                    </Stack>
                </CatalogSection>

                {/* 4. Composite Patterns & Feedback */}
                <CatalogSection title="4. 複合パターン & フィードバック (Feedback)" description="ユーザーへの通知や状態表示、インタラクション要素です。">
                    <Stack gap="lg">
                        <ComponentPreview title="Feedback (フィードバック)" description="状態やヒントを表示します。">
                            <Flex gap="xl" align="center" wrap>
                                <Stack gap="xs" align="center">
                                    <Text variant="xs" color="muted">Spinner & Dots</Text>
                                    <Flex gap="md" align="center">
                                        <Spinner size="md" />
                                        <Spinner size="md" variant="success" showTrack />
                                        <LoadingDots />
                                    </Flex>
                                </Stack>
                                <Stack gap="xs" align="center">
                                    <Text variant="xs" color="muted">Tooltip</Text>
                                    <Tooltip content="これは補足説明です">
                                        <View bg="muted" padding="xs" rounded="full">
                                            <Info size={16} />
                                        </View>
                                    </Tooltip>
                                </Stack>
                                <Stack gap="xs" align="center">
                                    <Text variant="xs" color="muted">Icons (Lucide)</Text>
                                    <Flex gap="sm">
                                        <Search size={20} />
                                        <Bell size={20} />
                                        <Star size={20} className="text-amber-400 fill-amber-400" />
                                    </Flex>
                                </Stack>
                            </Flex>
                        </ComponentPreview>
                        <ComponentPreview title="Modal (モーダル)" description="重要な対話や詳細表示に使用します。">
                            <Button onClick={() => setIsModalOpen(true)}>モーダルを開く</Button>
                        </ComponentPreview>
                        <ComponentPreview title="Toast (通知)" description="一時的なフィードバックを提供します。">
                            <Flex gap="sm" wrap>
                                <Button size="sm" color="success" onClick={() => addToast('success')}>Success</Button>
                                <Button size="sm" color="danger" onClick={() => addToast('danger')}>Danger</Button>
                                <Button size="sm" color="warning" onClick={() => addToast('warning')}>Warning</Button>
                                <Button size="sm" color="info" onClick={() => addToast('info')}>Info</Button>
                            </Flex>
                        </ComponentPreview>
                    </Stack>
                </CatalogSection>

                {/* フッター */}
                <Stack align="center" className="border-t pt-12 pb-8">
                    <Text variant="xs" color="muted">AiQ Design System • 2024</Text>
                </Stack>
            </Stack>

            {/* モーダル・インスタンス */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="システム確認"
                footer={
                    <Flex justify="end" gap="sm">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
                        <Button color="primary" onClick={() => setIsModalOpen(false)}>確定する</Button>
                    </Flex>
                }
            >
                <Stack gap="md">
                    <Text>変更を保存しますか？この操作は取り消せません。</Text>
                    <View bg="warning" padding="sm" rounded="sm">
                        <Text variant="xs" color="white">注意: ネットワーク接続を確認してください。</Text>
                    </View>
                </Stack>
            </Modal>
        </View>
    );
}

function CatalogSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <Stack gap="md" className="py-4">
            <Stack gap="xs">
                <Text variant="h2">{title}</Text>
                {description && <Text color="muted">{description}</Text>}
            </Stack>
            <View className="mt-4">
                {children}
            </View>
        </Stack>
    );
}

function ComponentPreview({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <Stack gap="sm" className="bg-surface-muted/30 p-6 rounded-lg border border-dashed">
            <Stack gap="xs" className="mb-2">
                <Text weight="bold">{title}</Text>
                {description && <Text variant="xs" color="muted">{description}</Text>}
            </Stack>
            <View>
                {children}
            </View>
        </Stack>
    );
}

function ColorBox({ label, color, border }: { label: string; color: BrandColorKey | SurfaceColorKey; border?: boolean }) {
    // BrandColorKey か SurfaceColorKey かで適用する背景プロパティを分ける
    const isBrandColor = (c: string): c is BrandColorKey =>
        ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'heart'].includes(c);

    return (
        <Stack gap="xs" align="center" className="w-20">
            <View
                bg={isBrandColor(color) ? (color as BrandColorKey) : (color as SurfaceColorKey)}
                className={cn("h-16 w-16 rounded-lg", border && "border")}
                shadow="sm"
            />
            <Text variant="xs" className="text-center">{label}</Text>
        </Stack>
    );
}
